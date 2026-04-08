import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import { pool } from "../db/connectDB-pg.js"; // Import your PostgreSQL pool
// const protectRoute = async (req, res, next) => {
//     try {
//         const token = req.cookies.jwt;
//         console.log(token);
//         if (!token) {
//             return res.status(400).json({error:`Unauthorized: No token Provided${jwt}`})
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         if (!decoded) {
//             res.status(400).json({ error: "Unauthorized: Invalid Token" });
//         }
//         const user = await User.findOne({ _id: decoded.userId }).select("-password");
//         if (!user) {
//             res.status(400).json({ error: "User Not Found" });
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(`Error in protectRoute Middleware:${error}`)
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }
// export default protectRoute

const protectRoute = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extract token from "Bearer <token>"
            token = authHeader.split(' ')[1];
        }
        // 2. Fallback to cookie
        else {
            token = req.cookies.jwt; // Assuming cookie name is 'awt' (adjust if needed)
        }
        
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Query the database using PostgreSQL
        const userQuery = await pool.query(
            'SELECT id, username, fullname, email, usertype, profile_img FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Map PostgreSQL snake_case to camelCase if needed
        const user = {
            id: userQuery.rows[0].id,
            username: userQuery.rows[0].username,
            fullname: userQuery.rows[0].fullname,
            email: userQuery.rows[0].email,
            usertype: userQuery.rows[0].usertype,
            profileImg: userQuery.rows[0].profile_img
        };

        req.user = user;
        next();
    } catch (error) {
        console.error(`Error in protectRoute middleware: ${error}`);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
};

export default protectRoute;