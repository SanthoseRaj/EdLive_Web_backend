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

// dotenv.config({
//   path: path.resolve(path.dirname("../"), `.env.${process.env.NODE_ENV}`),
// });

dotenv.config();


const app = express();

// const PORT = process.env.PORT;
const PORT = process.env.PORT || 7500;


const __dirname = path.resolve();
app.use(express.json({ limit: "5mb" }));
app.set('trust proxy', 1);
// app.get("*", (req, res) => {
//   const URL = req.protocol;
// });
const allowedOrigins = process.env.NODE_ENV === 'production' ? ['http://ec2-13-233-120-62.ap-south-1.compute.amazonaws.com'] : ['http://localhost:5000', 'http://ec2-13-233-120-62.ap-south-1.compute.amazonaws.com'];
app.use(cookieParser());
app.use(express.json());
// app.use(cors({
//     origin: [`${process.env.REACT_APP_API_URL}`,`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_REST_PORT}`],
//     methods: ["GET", "POST"],
//     credentials: true,
// }));
app.use(cors({
  origin: true,
  credentials: true
}
));
app.use(express.urlencoded({
  extended: true
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
app.use("/api/users", userRoute)
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
//   app.use(express.static(path.join(__dirname, "/frontend/build")));

//   app.use("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
//   });
// }

app.get("/", (req, res) => {
  res.status(200).send("Backend is running successfully");
});


app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Base URL: ${process.env.REACT_APP_API_URL}`);
  console.log(`Swagger docs available at /api-docs`);

  try {
    await db.connectDBpg();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
  }
});



// app.listen(PORT, () => {
//   console.log(`Server is running in port ${process.env.REACT_APP_API_URL}:${PORT}`);
//   console.log(`Swagger docs available at ${process.env.REACT_APP_API_URL}:${PORT}/api-docs`);
//   //connectDB()
//   db.connectDBpg()
// })