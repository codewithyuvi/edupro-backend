import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())


//routes import 
import adminRouter from './routes/admin.routes.js'
import subjectRouter from "./routes/subject.routes.js"
import filesRouter from "./routes/files.routes.js"

//routes declaration
app.use("/api/v1/admin", adminRouter) //middleware
app.use("/api/v1/admin", subjectRouter) //middleware
app.use("/api/v1/admin", filesRouter) //middleware



// Global error handler (must be after all other app.use and routes)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.error || [],
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

export { app }