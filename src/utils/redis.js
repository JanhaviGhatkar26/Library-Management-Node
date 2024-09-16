import { redisInstance } from "../db/database.js";

// alternate way for redis
// class RedisClient {
//   async set(key, value, expireIn = 7600) {
//     await redisInstance.set(key, JSON.stringify(value), "EX", expireIn);
//   }

//   async get(key) {
//     const data = await redisInstance.get(key);
//     return data ? JSON.parse(data) : null;
//   }

//   async del(key) {
//     await redisInstance.del(key);
//   }
// }

// export default RedisClient;

// Alternatively, if you also want to export individual functions:

export const setValue = async (key, value, expireIn = 7600) => {
  await redisInstance.set(key, JSON.stringify(value), "EX", expireIn);
};

export const getValue = async (key) => {
  const data = await redisInstance.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteValue = async (key) => {
  await redisInstance.del(key);
};
