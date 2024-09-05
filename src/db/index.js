import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host} PORT:${connectionInstance.connection.port}`
    );
    //console.dir(connectionInstance.connection, { depth: null, colors: true })
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR", error);
    process.exit(1);
  }
};

export default connectDB;
