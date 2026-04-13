import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto";
import generateToken, { getJwtCookieOptions } from "../utils/generateToken.js";
import {pool} from "../db/connectDB-pg.js";
import sendGmail from "../utils/emailUtils.js";
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

const PASSWORD_MIN_LENGTH = 6;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildTemporaryPassword = (length = 10) => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes = crypto.randomBytes(length);
    let password = "";

    for (let index = 0; index < length; index += 1) {
      password += charset[bytes[index] % charset.length];
    }

    return `${password}!1`;
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
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
      if (password.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
  
      // Hash password
      const hashedPassword = await hashPassword(password);
  
      // Create user
      const result = await query(
        `INSERT INTO users (username, fullname, email, password, usertype,phone_number)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, fullname, email, usertype, profile_img`,
        [username, fullname, email, hashedPassword, usertype,phone_number]
      );
  
      const newUser = result.rows[0];
      generateToken(newUser.id, res, req);
  
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
	a.profile_img,a.password
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
    username = $1 or email =$1 or phone_number=$1
GROUP BY 
    a.id, a.username, a.email, a.usertype, a.created_at
ORDER BY 
    a.id`,
        [username]
      );
  
      const user = result.rows[0];
      
      if (!user) {
        return res.status(400).json({ success: false,
          error: "Invalid credentials" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      
      if (!isPasswordCorrect) {
        return res.status(400).json({ success: false,
          error: "Invalid credentials"  });
      }
  
      const token = generateToken(user.id, res, req);
      const academicYear = getAcademicYear();
  
      res.status(200).json({
        success: true,
        token: token, // or accessToken: token   
        academicYear: academicYear,
        user:{
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          usertype: user.usertype,
          profileImg: user.profile_img,
          staffid:user.staff_id
        }
      });
  
    } catch (error) {
      handleDBError(error, res);
    }
  };

export const forgotPassword = async (req, res) => {
    const normalizedEmail = req.body?.email?.trim();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const client = await pool.connect();

    try {
      const userResult = await client.query(
        `SELECT id, fullname, email
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [normalizedEmail]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "No user found with this email" });
      }

      const user = userResult.rows[0];
      const temporaryPassword = buildTemporaryPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      await client.query("BEGIN");
      await client.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [hashedPassword, user.id]
      );

      const emailResult = await sendGmail({
        to: user.email,
        subject: "Edlive temporary password",
        textContent: `Hello ${user.fullname || "User"}, your temporary password is ${temporaryPassword}. Please sign in and change it immediately.`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <h2 style="margin-bottom: 12px;">Edlive temporary password</h2>
            <p>Hello ${user.fullname || "User"},</p>
            <p>Your temporary password is:</p>
            <p style="font-size: 20px; font-weight: 700; letter-spacing: 1px;">${temporaryPassword}</p>
            <p>Please sign in with this password and change it immediately from the profile menu.</p>
          </div>
        `,
      });

      if (emailResult.status !== "success") {
        throw new Error(emailResult.error || "Failed to send email");
      }

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message: "Temporary password sent to the registered email",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Forgot password error:", error);
      return res.status(500).json({ error: "Failed to reset password" });
    } finally {
      client.release();
    }
};

export const changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ error: "New password must be different from current password" });
      }

      const userResult = await query(
        `SELECT id, password
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);

      await query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [hashedPassword, req.user.id]
      );

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ error: "Failed to update password" });
    }
};

export const logout = async (req, res) => {
      try {
        const cookieOptions = getJwtCookieOptions(req);
        res.clearCookie("jwt", {
            ...cookieOptions,
            maxAge: 0,
            expires: new Date(0)
        });

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
        const cookieOptions = getJwtCookieOptions(req);
        res.clearCookie("jwt", {
            ...cookieOptions,
            maxAge: 0,
            expires: new Date(0)
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
      const userResult = await query(
        `SELECT id, username, fullname, email, usertype, created_at
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const selectedUserType =
        req.query.selectedUserType ||
        req.headers["x-selected-usertype"] ||
        req.cookies?.selectedUserType ||
        user.usertype;

      const [teacherResult, subjectResult, studentResult] = await Promise.all([
        query(
          `SELECT
             st.id,
             cm.class || ' - ' || cm.section AS class_name
           FROM staff st
           LEFT JOIN classmaster cm ON cm.id = st.class_id
           WHERE st.user_id = $1`,
          [req.user.id]
        ),
        query(
          `SELECT DISTINCT s.subject_name
           FROM staff st
           INNER JOIN timetable t ON t.staff_id = st.id
           INNER JOIN subjects s ON s.subject_id = t.subject_id
           WHERE st.user_id = $1`,
          [req.user.id]
        ),
        query(
          `SELECT
             st.id,
             st.full_name,
             cm.class || ' - ' || cm.section AS class_name
           FROM students st
           LEFT JOIN classmaster cm ON cm.id = st.class_id
           WHERE st.user_id = $1`,
          [req.user.id]
        ),
      ]);

      const teacherIds = teacherResult.rows.map((row) => row.id).filter(Boolean);
      const studentIds = studentResult.rows.map((row) => row.id).filter(Boolean);
      const teacherClasses = [...new Set(teacherResult.rows.map((row) => row.class_name).filter(Boolean))];
      const studentClasses = [...new Set(studentResult.rows.map((row) => row.class_name).filter(Boolean))];
      const teacherSubjects = [...new Set(subjectResult.rows.map((row) => row.subject_name).filter(Boolean))];
      const studentNames = [...new Set(studentResult.rows.map((row) => row.full_name).filter(Boolean))];

      const availableUserTypes = [...new Set([
        user.usertype,
        ...(teacherIds.length > 0 ? ["Teacher"] : []),
        ...(studentIds.length > 0 ? ["Student"] : []),
      ])];

      let effectiveUserType = user.usertype;
      if (selectedUserType === "Teacher" && teacherIds.length > 0) {
        effectiveUserType = "Teacher";
      } else if (selectedUserType === "Student" && studentIds.length > 0) {
        effectiveUserType = "Student";
      }

      const responsePayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        usertype: effectiveUserType,
        availableUserTypes,
      };

      if (effectiveUserType === "Teacher") {
        responsePayload.fullname = [user.fullname];
        responsePayload.staff_id = teacherIds;
        responsePayload.subject = teacherSubjects.join(", ");
        responsePayload.classes = teacherClasses;
      } else if (effectiveUserType === "Student") {
        responsePayload.fullname = studentNames.length > 0 ? studentNames : [user.fullname];
        responsePayload.staff_id = studentIds;
        responsePayload.subject = null;
        responsePayload.classes = studentClasses;
      } else {
        responsePayload.fullname = [user.fullname];
        responsePayload.staff_id = [];
        responsePayload.subject = null;
        responsePayload.classes = [];
      }

      res.status(200).json(responsePayload);
      
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
