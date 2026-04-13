import jwt  from "jsonwebtoken"


const isHttpsRequest = (req) => {
    if (!req) return process.env.NODE_ENV === "production";
    if (req.secure) return true;
    const forwardedProto = req.headers["x-forwarded-proto"];
    if (typeof forwardedProto === "string") {
        return forwardedProto.split(",")[0].trim() === "https";
    }
    return false;
};

export const getJwtCookieOptions = (req) => {
    const httpsEnabled = isHttpsRequest(req);
    const sameSite =
        process.env.COOKIE_SAMESITE ||
        (process.env.NODE_ENV === "production" ? "none" : "lax");
    const secure = process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === "true"
        : httpsEnabled;
    const domain = process.env.COOKIE_DOMAIN;

    const options = {
        httpOnly: true,
        sameSite,
        secure,
        path: "/",
        maxAge: 15 * 24 * 60 * 60 * 1000
    };

    if (domain) {
        options.domain = domain;
    }

    return options;
};

const generateToken=(userId,res,req)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"15d"
    });

    res.cookie("jwt", token, getJwtCookieOptions(req));
    return token;
};
export default generateToken;
