import jwt from "jsonwebtoken";
import { pool } from "../db/connectDB-pg.js";

const resolveSelectedUserType = (req, fallbackUserType = null) =>
  req.query.selectedUserType ||
  req.headers["x-selected-usertype"] ||
  req.cookies?.selectedUserType ||
  fallbackUserType;

const getEffectiveUser = async (userId, requestedUserType) => {
  const userQuery = await pool.query(
    "SELECT id, username, fullname, email, usertype, profile_img FROM users WHERE id = $1",
    [userId]
  );

  if (userQuery.rows.length === 0) {
    return null;
  }

  const baseUser = userQuery.rows[0];

  const [teacherResult, studentResult] = await Promise.all([
    pool.query("SELECT id FROM staff WHERE user_id = $1", [userId]),
    pool.query("SELECT id FROM students WHERE user_id = $1", [userId]),
  ]);

  const teacherIds = teacherResult.rows.map((row) => row.id).filter(Boolean);
  const studentIds = studentResult.rows.map((row) => row.id).filter(Boolean);

  let effectiveUserType = baseUser.usertype;
  if (requestedUserType === "Teacher" && teacherIds.length > 0) {
    effectiveUserType = "Teacher";
  } else if (requestedUserType === "Student" && studentIds.length > 0) {
    effectiveUserType = "Student";
  }

  return {
    id: baseUser.id,
    username: baseUser.username,
    fullname: baseUser.fullname,
    email: baseUser.email,
    usertype: effectiveUserType,
    baseUsertype: baseUser.usertype,
    profileImg: baseUser.profile_img,
    staff_id: effectiveUserType === "Teacher" ? teacherIds : studentIds,
  };
};

const runProtection = async (req, res, next, allowedUserTypes = []) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const effectiveUser = await getEffectiveUser(
      decoded.userId,
      resolveSelectedUserType(req)
    );

    if (!effectiveUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      allowedUserTypes.length > 0 &&
      !allowedUserTypes.includes(effectiveUser.usertype)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = effectiveUser;
    next();
  } catch (error) {
    console.error(`Error in protectRoute middleware: ${error}`);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

const protectRoute = (...allowedUserTypes) => {
  return (req, res, next) => runProtection(req, res, next, allowedUserTypes);
};

export default new Proxy(protectRoute, {
  apply(target, thisArg, args) {
    const [firstArg, secondArg, thirdArg] = args;

    if (
      firstArg &&
      typeof firstArg === "object" &&
      secondArg &&
      typeof secondArg === "object" &&
      typeof thirdArg === "function"
    ) {
      return runProtection(firstArg, secondArg, thirdArg, []);
    }

    return Reflect.apply(target, thisArg, args);
  },
});
