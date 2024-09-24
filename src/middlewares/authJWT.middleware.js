import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.util.js";

export const jwtVerification = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cokkies?.accssToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log(req.body);
    if (!token) {
      return res.status(401).json({ Status: `Unothorized request` });
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.person = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message });
  }
});
