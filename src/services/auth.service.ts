import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User, type IUser } from "../models/apps/auth/user.model";
import { setOtp, getOtp, deleteOtp } from "../lib/redis";
import { signAccessToken, signRefreshToken } from "../lib/jwt";
import {
    validateLoginInput,
    validateRegisterInput,
    validateResendOtpInput,
    validateVerifyOtpInput,
    type VerifyOtpInput,
    validateResetPasswordInput,
    type ResetPasswordInput,
    type LoginInput,
    type RegisterInput,
    type ResendOtpInput,
} from "../validators/auth.schema";
import { sendEmail } from "../lib/email/email";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

const sanitizeUser = (user: IUser) => {
    const { password, refreshToken, __v, ...rest } = user.toObject({ versionKey: false });
    return rest;
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendOtp(email: string, name: string) {
    const otp = generateOtp();
    await sendEmail(email, "Your OTP Code", `<div> Dear ${name},<br/> Your OTP code is: ${otp}</div>`);
    await setOtp(email, otp, OTP_TTL_SECONDS);
    // TODO: Integrate real email provider. For now, log for visibility.
    console.log(`OTP for ${email} (${name}): ${otp}`);
}

export async function register(input: any) {
    let data: RegisterInput;
    console.log(" Register service called", input);
    try {
        data = validateRegisterInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const existing = await User.findOne({ email: data.email });
    if (existing) {
        throw new ApiError(409, "User already exists with this email");
    }

    const user = await User.create({
        name: data.name || data.email.split("@")[0],
        email: data.email,
        password: data.password,
        isEmailVerified: false,
    });
    console.log(" user", user)
    await sendOtp(user.email, user.name);

    return new ApiResponse(201, { user: sanitizeUser(user) }, "User registered. OTP sent to email.");
}

export async function verifyEmailOtp(input: any) {
    let data: VerifyOtpInput;
    try {
        data = validateVerifyOtpInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const storedOtp = await getOtp(data.email);
    if (!storedOtp || storedOtp !== data.otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    await deleteOtp(data.email);

    return new ApiResponse(200, { user: sanitizeUser(user) }, "Email verified");
}

export async function resendEmailOtp(input: any) {
    let data: ResendOtpInput;
    try {
        data = validateResendOtpInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }
    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await sendOtp(user.email, user.name);
    return new ApiResponse(200, {}, "OTP re-sent to email");
}

export async function requestPasswordReset(input: any) {
    let data: ResendOtpInput;
    try {
        data = validateResendOtpInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await sendOtp(user.email, user.name);
    return new ApiResponse(200, {}, "OTP sent. Please verify your email with the new password.");
}

export async function login(input: any) {
    let data: LoginInput;
    try {
        data = validateLoginInput(input);
        console.log(" Login data validated", data);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const passwordOk = await user.isPasswordCorrect(data.password);
    if (!passwordOk) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Email not verified. Please verify using OTP.");
    }

    const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ _id: user._id.toString(), role: user.role, email: user.email });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return new ApiResponse(200, {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    }, "Logged in successfully");
}

export async function loginWithOtp(input: any) {
    let data: VerifyOtpInput;
    try {
        data = validateVerifyOtpInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const storedOtp = await getOtp(data.email);
    if (!storedOtp || storedOtp !== data.otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.loginType = "EMAIL_OTP";

    const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ _id: user._id.toString(), role: user.role, email: user.email });

    user.refreshToken = refreshToken;
    await Promise.all([
        user.save({ validateBeforeSave: false }),
        deleteOtp(data.email),
    ]);

    return new ApiResponse(200, {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    }, "Logged in with OTP successfully");
}

export async function resetPasswordWithOtp(input: any) {
    let data: ResetPasswordInput;
    try {
        data = validateResetPasswordInput(input);
    } catch (err: any) {
        throw new ApiError(400, err.message);
    }

    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const storedOtp = await getOtp(data.email);
    if (!storedOtp || storedOtp !== data.otp) {
        throw new ApiError(400, "Incorrect OTP. Please enter the correct OTP");
    }

    user.password = data.password; // hashed by pre-save hook
    user.isEmailVerified = true;
    user.loginType = "EMAIL_PASSWORD_RESET";

    const accessToken = signAccessToken({ _id: user._id.toString(), role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ _id: user._id.toString(), role: user.role, email: user.email });

    user.refreshToken = refreshToken;
    await Promise.all([
        user.save(),
        deleteOtp(data.email),
    ]);

    return new ApiResponse(200, {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    }, "Password updated. Logged in successfully");
}
