import express from "express";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from './routes/admin.routes.js'
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));



//Routers
 app.use("/api/auth",authRoutes);
 app.use("/api/admin",adminRoutes);





export { app };
