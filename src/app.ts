import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";

import indexRoutes from "./routes/index.routes";
import weekRoutes from "./routes/week.routes";
import workoutRoutes from "./routes/workout.routes";
import exerciseRoutes from "./routes/exercise.routes";
import authRoutes from "./routes/auth.routes"; 

import setupErrorHandling from "./error-handling";

const app: Application = express();

// middlewares
app.use(morgan("dev"));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api", indexRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/exercises", exerciseRoutes);

app.use("/auth", authRoutes);

// error handling
setupErrorHandling(app);

export default app;