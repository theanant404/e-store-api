import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserRolesEnum } from "../../../constants";
import { signAccessToken, signRefreshToken, type JwtPayload } from "../../../lib/jwt";

const SALT_ROUNDS = 10;

export interface IUser extends Document {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    role: string;
    isEmailVerified: boolean;
    refreshToken?: string;
    loginType?: string;
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
    isPasswordCorrect: (password: string) => Promise<boolean>;
    generateTemporaryToken: () => {
        unHashedToken: string;
        hashedToken: string;
        tokenExpiry: number;
    };
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        mobile: { type: String, unique: true, sparse: true },
        password: { type: String, required: true, minlength: 8 },
        role: { type: String, enum: Object.values(UserRolesEnum), default: UserRolesEnum.USER },
        isEmailVerified: { type: Boolean, default: false },
        refreshToken: { type: String },
        loginType: { type: String, default: "EMAIL_PASSWORD" },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    const payload: JwtPayload = { _id: this._id.toString(), role: this.role, email: this.email };
    return signAccessToken(payload);
};

userSchema.methods.generateRefreshToken = function () {
    const payload: JwtPayload = { _id: this._id.toString(), role: this.role, email: this.email };
    return signRefreshToken(payload);
};

userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    return { unHashedToken, hashedToken, tokenExpiry };
};

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);
