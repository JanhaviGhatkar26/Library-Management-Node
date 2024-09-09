import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const librarianSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile_no: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    userName: {
      type: String,
      // unique: true,
      // required:true,
    },
    password: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

librarianSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();
  const name = this.name.split(" ")[0].toLowerCase();
  let username = name + "_" + Math.floor(Math.random() * 1000);
  const existingUserName = await this.constructor.findOne({
    userName: username,
  });
  if (existingUserName) {
    let count = 1;
    while (
      await this.constructor.findOne({ userName: username + "_" + count })
    ) {
      count++;
    }
    username = username + "_" + count;
  }
  this.userName = username;
  next();
});

librarianSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

librarianSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

librarianSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      status: this.status,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

librarianSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
librarianSchema.plugin(mongooseAggregatePaginate);
export const Librarian = model("Librarian", librarianSchema);
