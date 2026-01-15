import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at Port : ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed :", error);
  });
