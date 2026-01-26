import express from "express";
import cors from 'cors';
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from './routes/admin.routes.js'
import hospitalRoutes from "./routes/hospital.routes.js";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend
  credentials: true,
}));




app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));



//Routers
 app.use("/api/auth",authRoutes);
 app.use("/api/admin",adminRoutes);
app.use("/api/hospital", hospitalRoutes);





export { app };
