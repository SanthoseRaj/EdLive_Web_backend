import jwt  from "jsonwebtoken"


const generateToken=(userId,res)=>{
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Domain:", process.env.NODE_ENV === "production" ? ".azure.com" : "localhost");
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"15d"
    })
    res.cookie("jwt",token,{
        maxAge:15*24*60*1000,
        httponly:true,
        sameSite: process.env.NODE_ENV === "production" ?"strict":"lax",
        domain:process.env.NODE_ENV === "production" ? ".azure.com" : "localhost",
        secure: process.env.NODE_ENV === "production" ? false : false,
        path:'/'
    })
    return token;
}
export default generateToken;