import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";

export interface UserDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    isVeryfies: boolean;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVeryfies: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
},
{
    timestamps: true
}
);


userSchema.pre("save", function (next) {
    if (this.isModified("password")) {
        this.updatedAt = new Date();
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword : string) {
    return  comparePassword(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
   this.password = await hashPassword(this.password, await bcrypt.genSalt(10))
    next();
});

const User = mongoose.model("User", userSchema);
export default User;