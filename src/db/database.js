import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

const databaseConnection = async () => {
  try {
    const connectionStr = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_Name}`
    );
    console.log(`MongooseDB connect. DB host:${connectionStr.connection.host}`);
  } catch (error) {
    console.log("Mongoose connection FAILED", error);
  }
};
export { databaseConnection };
