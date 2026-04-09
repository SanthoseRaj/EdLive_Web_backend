import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js";
import {pool} from "../db/connectDB-pg.js";
// export const signup = async (req, res) => {
//     try {
//         const { username, fullname, email, password, usertype } = req.body;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json({ error: "Invalid email Format" })
//         }
//         const existingEmail = await User.findOne({ email })
//         const existingUsername = await User.findOne({ username })
//         if (existingEmail || existingUsername) {
//             return res.status(409).json({ error: "Already Existing User or Email" })
//         }
//         if (password.length < 6) {
//             return res.status(400).json({ error: "Password must have atleast 6 char length" })
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             username,
//             fullname,
//             email,
//             password: hashedPassword,
//             usertype
//         })
//         if (newUser) {
//             generateToken(newUser._id, res)
//             await newUser.save();
//             res.status(200).json({
//                 _id: newUser._id,
//                 username: newUser.username,
//                 fullname: newUser.fullname,
//                 email: newUser.email,
//                 usertype: newUser.usertype,
//                 profileImg: newUser.profileImg
//             })
//         } else {
//             res.status(400).json({ error: "Invalid User Data" })
//         }
//     } catch (error) {
//         console.log(`Error in SignUp Controller : ${error}`)
//         res.status(500).json({ error: "Internal Server Error" })
//     }
// }

// Helper function for handling database errors

const getAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};
const handleDBError = (error, res) => {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: "User already exists" });
    }
    console.error('Database Error:', error);
    return res.status(500).json({ error: "Internal Server Error" });
};
  
const query = async (text, params) => {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
};
  
  
  export const signup = async (req, res) => {
    try {
      const { username, fullname, email, password, usertype,phone_number } = req.body;
  
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email Format" });
      }
  
      // Check existing users
      const userCheck = await query(
        `SELECT * FROM users WHERE username = $1 OR email = $2 or phone_number=$3`,
        [username, email,phone_number]
      );
  
      if (userCheck.rows.length > 0) {
        return res.status(409).json({ error: "Username or email already exists" });
      }
  
      // Password validation
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create user
      const result = await query(
       `INSERT INTO users (username, fullname, email, password, usertype, phone_number)
 VALUES ($1, $2, $3, $4, $5, $6)
 RETURNING id, username, fullname, email, usertype, profile_img`,
        [username, fullname, email, hashedPassword, usertype,phone_number]
      );
  
      const newUser = result.rows[0];
      generateToken(newUser.id, res);
  
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        usertype: newUser.usertype,
        profileImg: newUser.profile_img
      });
  
    } catch (error) {
      handleDBError(error, res);
    } 
  };
// export const login = async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const user = await User.findOne({ username });
//         const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
//         if(!user || !isPasswordCorrect){
//             return res.status(400).json({ error: "Invalid username or password" })
//         }
//         generateToken(user._id,res);
//         res.status(200).json({
//             _id: user._id,
//             username: user.username,
//             fullname: user.fullname,
//             email: user.email,
//             usertype: user.usertype,
//             profileImg: user.profileImg
//         })

//     } catch (error) {
//         console.log(`Error in login Controller:${error}`)
//         res.status(500).json({ error: "Internal Server Error" })
//     }
// }
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await query(
      `SELECT 
        a.id, 
        a.username, 
        ARRAY_AGG(DISTINCT 
          CASE 
            WHEN a.usertype = 'Student' THEN st.full_name
            WHEN a.usertype = 'Teacher' THEN a.fullname
            ELSE a.fullname
          END
        ) AS fullname, 
        a.email, 
        a.usertype, 
        a.created_at,
        ARRAY_AGG(DISTINCT 
          CASE 
            WHEN a.usertype = 'Student' THEN st.id
            WHEN a.usertype = 'Teacher' THEN b.id
            ELSE NULL
          END
        ) AS staff_id,
        STRING_AGG(DISTINCT s.subject_name, ', ') AS subject,
        ARRAY_AGG(DISTINCT cm.class || ' - ' || cm.section) AS classes,
        a.profile_img,
        a.password
      FROM users a 
      LEFT OUTER JOIN staff b 
        ON a.id = b.user_id AND a.usertype = 'Teacher'
      LEFT OUTER JOIN students st 
        ON a.id = st.user_id AND a.usertype = 'Student'
      LEFT JOIN timetable t 
        ON (b.id = t.staff_id AND a.usertype = 'Teacher')
      LEFT JOIN subjects s 
        ON t.subject_id = s.subject_id
      LEFT JOIN classmaster cm 
        ON (cm.id = b.class_id AND a.usertype = 'Teacher') 
        OR (cm.id = st.class_id AND a.usertype = 'Student')
      WHERE username = $1 OR email = $1 OR phone_number = $1
      GROUP BY 
        a.id, a.username, a.email, a.usertype, a.created_at, a.profile_img, a.password
      ORDER BY a.id`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = generateToken(user.id, res);
    const academicYear = getAcademicYear();

    res.status(200).json({
      success: true,
      token,
      academicYear,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        usertype: user.usertype,
        profileImg: user.profile_img,
        staffid: user.staff_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    handleDBError(error, res);
  }
};
export const logout = async (req, res) => {
      try {
        // Get token from cookies
        const token = req.cookies.jwt;
        
        // Clear the JWT cookie with proper options
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 0
        });

        // Optional: Add token to blacklist (if you implement token blacklisting)
        // await blacklistToken(token);
res.clearCookie("jwt", { path: '/', maxAge: 0 });
    res.clearCookie("token"), { path: '/', maxAge: 0 };
        // Send response with cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).json({ 
            success: true,
            message: "Logged out successfully" 
        });

    } catch (error) {
        console.log(`Error in logout controller: ${error}`);
        
        // Even if there's an error, try to clear the cookie
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        res.status(500).json({ 
            success: false,
            error: "Internal Server Error" 
        });
    }
}
// export const getMe = async (req, res) => {
//     try {
//         const user = await User.findOne({ _id: req.user._id }).select("-password")
//         res.status(200).json(user)
//     } catch (error) {
// 		console.log(`Error in getMe controller: ${error}`);
// 		res.status(500).json({ error: "Internal Server Error" });
// 	}
// }
export const getMe = async (req, res) => { 
    try {
      const result = await query(
        `SELECT 
    a.id, 
    a.username, 
    ARRAY_AGG(DISTINCT 
        CASE 
            WHEN a.usertype = 'Student' THEN st.full_name
            WHEN a.usertype = 'Teacher' THEN a.fullname
            ELSE a.fullname
        END
    ) AS fullname, 
    a.email, 
    a.usertype, 
    a.created_at,
    ARRAY_AGG(DISTINCT 
        CASE 
            WHEN a.usertype = 'Student' THEN st.id
            WHEN a.usertype = 'Teacher' THEN b.id
            ELSE NULL
        END
    ) AS staff_id,
    STRING_AGG(DISTINCT s.subject_name, ', ') AS subject,
    ARRAY_AGG(DISTINCT cm.class || ' - ' || cm.section) AS classes
FROM 
    users a 
LEFT OUTER JOIN 
    staff b ON a.id = b.user_id AND a.usertype = 'Teacher'
LEFT OUTER JOIN 
    students st ON a.id = st.user_id AND a.usertype = 'Student'
LEFT JOIN 
    timetable t ON (b.id = t.staff_id AND a.usertype = 'Teacher') 
LEFT JOIN 
    subjects s ON t.subject_id = s.subject_id
LEFT JOIN
    classmaster cm ON (cm.id = b.class_id AND a.usertype = 'Teacher') or (cm.id = st.class_id AND a.usertype = 'Student')
WHERE 
    a.id = $1
GROUP BY 
    a.id, a.username, a.email, a.usertype, a.created_at
ORDER BY 
    a.id`,
        [req.user.id]
      );
      
      const user = result.rows[0];
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json(user);
      
    } catch (error) {
      handleDBError(error, res);
    }
  };
  export const getMenu = async (req, res) => {
  try {
    const { userType } = req.query;

    const query = `
      SELECT 
        id,
        title,
        path,
        menu_type AS "menuType",
        parent_id AS "parentId",
        user_type AS "userType",
        display_order AS "displayOrder"
      FROM menu_items
      WHERE user_type = $1 OR user_type = 'all'
      ORDER BY display_order ASC
    `;

    const { rows } = await pool.query(query, [userType]);

    // Separate parent and child items
    const menuItems = rows.filter(item => !item.parentId);
    const menuWithSubItems = menuItems.map(item => {
      const subItems = rows
        .filter(subItem => subItem.parentId === item.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      return {
        ...item,
        subItems, // always include subItems, even if empty
      };
    });

    res.json(menuWithSubItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};