import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // Import UUID

const userSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      default: () => uuidv4(), // Auto-generate UUID
    },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false }, // don't return password by default
  },
  { 
    timestamps: true,
    toJSON: { 
      transform(doc, ret) {
        delete ret.password; // Always remove password from API response
        return ret;
      }
    }
  }
);

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
