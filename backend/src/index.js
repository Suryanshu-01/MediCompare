import "dotenv/config";
//aisa isliye kiye kyuki .env file baad main execute ho rha tha pehle app.js execute hoo rha tha
console.log("\nDOTENV is loaded");
import connectDB from "./config/db.js";
import { app } from "./app.js";

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
