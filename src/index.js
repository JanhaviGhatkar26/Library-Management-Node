import dotenv from "dotenv";
import { databaseConnection, redisInstance } from "./db/database.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

databaseConnection()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is runing on: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB Connection failed....!!`, err);
  });
