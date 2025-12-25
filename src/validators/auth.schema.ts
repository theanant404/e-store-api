export type RegisterInput = {
    name?: string;
    email: string;
    password: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export type VerifyOtpInput = {
    email: string;
    otp: string;
};
export type ResendOtpInput = {
    email: string;
};
export type ResetPasswordInput = {
    email: string;
    otp: string;
    password: string;
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(body: any): RegisterInput {
    const { name, email, password } = body ?? {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new Error("Name is required and must be at least 2 characters");
    }
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new Error("Valid email is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }
    return { name: name.trim(), email: email.toLowerCase(), password };
}

export function validateLoginInput(body: any): LoginInput {
    const { email, password } = body ?? {};
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new Error("Valid email is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }
    return { email: email.toLowerCase(), password };
}

export function validateVerifyOtpInput(body: any): VerifyOtpInput {
    const { email, otp } = body ?? {};
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new Error("Valid email is required");
    }
    if (!otp || typeof otp !== "string" || otp.length < 4) {
        throw new Error("OTP is required");
    }
    return { email: email.toLowerCase(), otp };
}

export function validateResendOtpInput(body: any): ResendOtpInput {
    const { email } = body ?? {};
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new Error("Valid email is required");
    }
    return { email: email.toLowerCase() };
}

export function validateResetPasswordInput(body: any): ResetPasswordInput {
    const { email, otp, password } = body ?? {};
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        throw new Error("Valid email is required");
    }
    if (!otp || typeof otp !== "string" || otp.length < 4) {
        throw new Error("OTP is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }
    return { email: email.toLowerCase(), otp, password };
}