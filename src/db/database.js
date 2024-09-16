import mongoose from "mongoose";
import Redis from "ioredis";
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

console.log("process.env.REDIS_HOST :", process.env.REDIS_HOST);
console.log("process.env.REDISPORT :", process.env.REDISPORT);

const redisInstance = new Redis({
  host: process.env.REDIS_HOST, // Default Redis host
  port: process.env.REDISPORT, // Default Redis port
  db: 0, // Select Redis DB index (default is 0)
});

redisInstance.on("connect", () => {
  console.log("Connected to Redis successfully");
});

redisInstance.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export { databaseConnection, redisInstance };
