import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, //aisa likhne se password kabhi query ke through return nhi hota hai
    },
    role: {
      type: String,
      enum: ["USER", "HOSPITAL", "ADMIN"],
      default: "USER",
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    //V1 always true, in V2 verification will be implimented
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  //pre("save") is a hook in mongoose it runs before doc is saved in mongoose.
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10); //genSalt random hashes create and codes create krta hai taaki even same pass ho tab bhi different code bane her baar.
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};


const User = mongoose.model("User",userSchema);

export default User;