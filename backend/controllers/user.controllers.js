import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import {pool} from "../db/connectDB-pg.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// export const getProfile = async (req, res) => {
//     try {
//         const { username } = req.params;
//         const user = await User.findOne({ username }).select("-password");
//         if (!user) {
//             return res.status(404).json({error:"User Not Found"})
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         console.log(`Error in get User Profile Controller:${error}`)
//         res.status(500).json({error:"Internal Server Error"})
//     }
// }
export const getProfile = async (req, res) => {
    try {
      const { username } = req.params;
      const result = await pool.query(
        'SELECT id, username, fullname, email, usertype, created_at FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User Not Found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log(`Error in get User Profile Controller: ${error}`);
      res.status(500).json({ error: "Internal Server Error" });
    }
};
  
export const getProfileById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, username, fullname, email, usertype, created_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User Not Found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log(`Error in get User Profile Controller: ${error}`);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
// export const UserList = async (req, res) => {
//     try {
//         const  usertype  = req.user["usertype"];
//         if (usertype !== "Staff Admin") {
//             return res.status(404).json({error:"User Not Authorized"})
//         }
//         const users = await User.find().select('-password -__v');
//         res.json(users);
        
//     } catch (error) {
//         console.log(`Error in get User List Controller:${error}`)
//         res.status(500).json({error:"Internal Server Error"})
//     }
// }
export const UserList = async (req, res) => {
    try {
      const usertype = req.user["usertype"];
      if (usertype !== "Staff Admin") {
        return res.status(403).json({ error: "User Not Authorized" });
      }
      
      const result = await pool.query(
      `SELECT 
    a.id, 
    a.username, 
     a.fullname fullname, 
    a.email, 
    a.phone_number, 
    case when a.usertype in ('Staff Admin','Class Admin') then 'Admin' else 'User' end usertype, 
    a.created_at,
    CASE 
        WHEN a.usertype = 'Student' THEN STRING_AGG(DISTINCT st.full_name::varchar, ', ')
        WHEN a.usertype = 'Teacher' THEN STRING_AGG(DISTINCT b.id::varchar, ', ')
        ELSE NULL
    END AS staff_id,
    STRING_AGG(DISTINCT s.subject_name, ', ') AS subject,
    CASE 
        WHEN a.usertype = 'Teacher' THEN STRING_AGG(DISTINCT cm.class || ' - ' || cm.section, ', ')
        WHEN a.usertype = 'Student' THEN STRING_AGG(DISTINCT cm_student.class || ' - ' || cm_student.section, ', ')
        ELSE NULL
    END AS classes
FROM 
    users a 
LEFT OUTER JOIN 
    staff b ON a.id = b.user_id AND a.usertype = 'Teacher'
LEFT OUTER JOIN 
    students st ON a.id = st.user_id AND a.usertype = 'Student'
-- Teacher timetable and subjects
LEFT JOIN 
    timetable t ON (b.id = t.staff_id AND a.usertype = 'Teacher') 
LEFT JOIN 
    subjects s ON t.subject_id = s.subject_id
-- Teacher class information
LEFT JOIN
    classmaster cm ON (cm.id = b.class_id AND a.usertype = 'Teacher')
-- Student class information (assuming students have a class_id in students table)
LEFT JOIN
    classmaster cm_student ON (cm_student.id = st.class_id AND a.usertype = 'Student')
GROUP BY 
    a.id, a.username, a.fullname, a.email, a.phone_number, a.usertype, a.created_at
ORDER BY 
    a.id`
    );
      res.json(result.rows);
    } catch (error) {
      console.log(`Error in get User List Controller: ${error}`);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
// export const UserAdd = async (req, res) => {
//     try{
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
//         });
//             await newUser.save();
        
//         const userWithoutPassword = newUser.toObject();
//         delete userWithoutPassword.password;
//         res.status(201).json(userWithoutPassword);
//     }catch (error) {
//         console.log(`Error in get User Add Controller:${error}`)
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ message: err.message });
//           }
//         res.status(500).json({error:"Internal Server Error"})
//     }
// }

export const UserAdd = async (req, res) => {
  try {
    const { username, fullname, email, password, usertype, phone_number } = req.body; // Add phone_number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email Format" });
    }

    // Check existing user - add phone number check
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2 OR phone_number = $3',
      [username, email, phone_number]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (existing.email === email) {
        return res.status(409).json({ error: "Email already exists" });
      }
      if (existing.phone_number === phone_number) {
        return res.status(409).json({ error: "Phone number already exists" });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Add phone number validation
    if (!phone_number || phone_number.trim().length < 10) {
      return res.status(400).json({ error: "Valid phone number is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (username, fullname, email, password, usertype, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, fullname, email, usertype, phone_number, created_at`,
      [username, fullname, email, hashedPassword, usertype, phone_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(`Error in User Add Controller: ${error}`);
    if (error.code === '23505') {
      return res.status(409).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// export const UserEdit = async (req, res) => {
//     try{
//         const { _id } = req.params;
//         const { username, fullname, email, usertype, password } = req.body;

//         const user = await User.findById(_id);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         // Check email uniqueness if changed
//         if (email && email !== user.email) {
//         const existingEmail = await User.findOne({ email });
//         if (existingEmail) return res.status(409).json({ message: 'Email already exists' });
//         }

//         // Update fields
//         user.username = username || user.username;
//         user.fullname = fullname || user.fullname;
//         user.email = email || user.email;
//         user.usertype = usertype || user.usertype;
        
//         if (password) {
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);
//         }

//         await user.save();
        
//         const userWithoutPassword = user.toObject();
//         delete userWithoutPassword.password;
//         res.json(userWithoutPassword);
//     }catch (error) {
//         console.log(`Error in get User Edit Controller:${error}`)
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ message: err.message });
//           }
//         res.status(500).json({error:"Internal Server Error"})
//     }

// }
export const UserEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullname, email, usertype, password, phone_number } = req.body; // Add phone_number

    // Get existing user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const updates = [];
    const values = [];
    let valueIndex = 1;

    // Check for unique fields - add phone number check
    if (email && email !== user.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      updates.push(`email = $${valueIndex}`);
      values.push(email);
      valueIndex++;
    }

    if (username && username !== user.username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );
      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      updates.push(`username = $${valueIndex}`);
      values.push(username);
      valueIndex++;
    }

    if (phone_number && phone_number !== user.phone_number) {
      const phoneCheck = await pool.query(
        'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
        [phone_number, id]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Phone number already exists' });
      }
      updates.push(`phone_number = $${valueIndex}`);
      values.push(phone_number);
      valueIndex++;
    }

    if (fullname) {
      updates.push(`fullname = $${valueIndex}`);
      values.push(fullname);
      valueIndex++;
    }

    if (usertype) {
      updates.push(`usertype = $${valueIndex}`);
      values.push(usertype);
      valueIndex++;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password = $${valueIndex}`);
      values.push(hashedPassword);
      valueIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING id, username, fullname, email, usertype, phone_number, created_at
    `;
    
    values.push(id);
    const result = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.log(`Error in User Edit Controller: ${error}`);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Duplicate unique field' });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// export const UserDelete = async (req, res) => {
//     try{
//         const { _id } = req.params;
//     const user = await User.findByIdAndDelete(_id);
    
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json({ message: 'User deleted successfully' });
//     }catch (error) {
//         console.log(`Error in get User Delete Controller:${error}`)
//         res.status(500).json({error:"Internal Server Error"})
//     }

// }
export const UserDelete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('BEGIN');
    try {
      // Get all tables that reference this user
      const staffResult = await pool.query(
        'SELECT id FROM staff WHERE user_id = $1',
        [id]
      );
      if (staffResult.rows.length > 0) {
        const staffId = staffResult.rows[0].id;
        
        // Delete from all tables that reference staff
        await pool.query('DELETE FROM staff_personal_info WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_service_info WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_family WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_experiences WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_education WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_documents WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM staff_class_responsibilities WHERE staff_id = $1', [staffId]);
        await pool.query('DELETE FROM timetable WHERE staff_id = $1', [staffId]);
        
        // Then delete the staff record
        await pool.query('DELETE FROM staff WHERE id = $1', [staffId]);

        const staffFolderPath = path.join(__dirname, '..', 'content', 'staff', staffId.toString());
        try {
          await fs.rm(staffFolderPath, { recursive: true, force: true });
          console.log(`Deleted staff folder: ${staffFolderPath}`);
        } catch (err) {
          console.error(`Error deleting staff folder: ${err.message}`);
          // Continue even if folder deletion fails
        }
      }
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      await pool.query('COMMIT');
      res.json({ message: 'User and all related data deleted successfully' });
    }catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.log(`Error in User Delete Controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};