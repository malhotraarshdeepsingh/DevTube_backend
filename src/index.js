import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

// require('dotenv').config({path:'.env'})
dotenv.config({ path: "./env" });

// Connect to MONGODB
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB error: " + err);
  });
