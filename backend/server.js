//const express = require("express")
import express from "express"
import dotenv from "dotenv"
import path from "path"
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import masterRoute from "./routes/master.route.js"
import ToDoRoute from "./routes/todo.route.js"
import connectDB from "./db/connectDB.js";
import db from "./db/connectDB-pg.js";
import staffRoute from "./routes/staff.route.js"
import studentRoute from "./routes/student.route.js";
import settingRoute from "./routes/setting.route.js";
import attendanceRoute from "./routes/attendance.route.js";
import achievementRoute from "./routes/achivement.route.js" 
import examRoute from "./routes/exam.route.js" 
import paymentRoute from "./routes/payment.route.js" 
import libraryRoute from "./routes/library.route.js" 
import eventsholidaysRoute from "./routes/eventsholidays.route.js" 
import messageRoute from "./routes/messages.route.js" 
import ptaRoute from "./routes/pta.route.js"
import syllabusRoute from "./routes/syllabus.route.js" 
import transportRoute from "./routes/transport.route.js" 
import foodRoute from "./routes/food.route.js" 
import quicknotesRoute from "./routes/quicknotes.route.js" 
import resourcesRoute from "./routes/resources.route.js" 
import coCurricularRoutes from "./routes/coCurricular.route.js" 
import dashboardRoute from "./routes/dashboard.route.js" 
import specialcareRoute from "./routes/specialCare.route.js" 
import stickynotesRoute from "./routes/stickynotes.route.js" 
import admissionRoute from "./routes/admission.route.js"

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
});
// Fallback for local/dev if environment-specific file does not exist.
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const __dirname = path.resolve();
app.use(express.json({ limit: "5mb" }));
app.set("trust proxy", process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1);
// app.get("*", (req, res) => {
//   const URL = req.protocol;
// });
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cookieParser());
app.use(express.json());

if (process.env.FORCE_HTTPS === "true") {
  app.use((req, res, next) => {
    const proto = req.headers["x-forwarded-proto"];
    const isHttps = req.secure || (typeof proto === "string" && proto.split(",")[0].trim() === "https");
    if (isHttps) return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"));
  },
  credentials: true
}
));
  app.use(express.urlencoded({
    extended:true
  }))

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API with Swagger",
      version: "1.0.0",
      description: "A simple Express API with Swagger documentation",
    },
    //servers: [{ url: `${process.env.REACT_APP_API_URL}:${PORT}` }],
  },
  apis: ["./backend/routes/*.js"], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(`/api/auth`, authRoute);
app.use("/api/users",userRoute)
app.use(`/api/todos`, ToDoRoute);
app.use(`/api/staff`, staffRoute);
app.use(`/api/student`, studentRoute);
app.use(`/api/master`, masterRoute);
app.use(`/api/setting`, settingRoute);
app.use(`/api/attendance`, attendanceRoute);
app.use(`/api/achievements`, achievementRoute);
app.use(`/api/exams`, examRoute);
app.use(`/api/payments`, paymentRoute);
app.use(`/api/library`, libraryRoute);
app.use(`/api/events-holidays`, eventsholidaysRoute);
app.use(`/api/messages`, messageRoute);
app.use(`/api/pta`, ptaRoute);
app.use(`/api/syllabus`, syllabusRoute);
app.use(`/api/transport`, transportRoute);
app.use(`/api/food`, foodRoute);
app.use(`/api/quicknotes`, quicknotesRoute);
app.use(`/api/resources`, resourcesRoute);
app.use(`/api/co-curricular`, coCurricularRoutes);
app.use(`/api/dashboard`, dashboardRoute);
app.use(`/api/special-care`, specialcareRoute);
app.use(`/api/stickynotes`, stickynotesRoute);
app.use(`/api/admission`, admissionRoute);
app.use('/content', express.static(path.join(__dirname, 'content'), {
  setHeaders: (res, path) => {
    const mimeType = express.static.mime.lookup(path);
    res.setHeader('Content-Type', mimeType);
  }
}));
// app.get("/", (req, res) => {
//    console.log(req.cookies);
// })

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));

// 	app.use("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }

app.get("/", (req, res) => {
  res.send("EdLive Backend API is running 🚀");
});


app.listen(PORT, () => {
    console.log(`Server is running in port ${process.env.REACT_APP_API_URL}:${PORT}`);
    console.log(`Swagger docs available at ${process.env.REACT_APP_API_URL}:${PORT}/api-docs`);
  //connectDB()
  db.connectDBpg()
})
