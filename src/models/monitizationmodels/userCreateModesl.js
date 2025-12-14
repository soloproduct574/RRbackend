import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: "user" }
});

export default mongoose.model("Usermontization", UserSchema);
