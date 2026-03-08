import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import searchRoutes from "./routes/search.routes.js";
import loincRoutes from "./routes/loinc.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import compareDoctorRoutes from "./routes/doctors/compare.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import { getDoctorsByHospitalId } from "./controllers/doctor.controller.js";
import { getServicesByHospitalId } from "./controllers/services.controller.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://medicompare.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is running" });
});

//Routers
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api", mapsRoutes);
app.use("/api/services/loinc", loincRoutes);
app.use("/api", searchRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/doctors", compareDoctorRoutes);

// Public routes - for users to view hospital doctors and services
// Only requires authentication, no role restrictions
app.get(
  "/api/doctor/hospital/:hospitalId",
  authMiddleware,
  getDoctorsByHospitalId,
);
app.get(
  "/api/services/hospital/:hospitalId",
  authMiddleware,
  getServicesByHospitalId,
);

export { app };
