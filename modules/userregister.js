import mongoose from "mongoose";

const userRegisterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const UserRegister = mongoose.models?.User || mongoose.model('User', userRegisterSchema);

export default UserRegister;
