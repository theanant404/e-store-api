import Redis from "ioredis";
import { sendEmail } from "./email";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Single shared Redis client
export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
});

redis.on("error", (err) => {
    console.error("Redis connection error", err);
});

redis.on("connect", () => {
    console.log("Redis connected");
});

export const setOtp = async (email: string, otp: string, ttlSeconds: number) => {
    await sendEmail(email, "Your OTP Code", `<p>Your OTP code is: ${otp}</p>`);
    await redis.set(`otp:${email}`, otp, "EX", ttlSeconds);

};

export const getOtp = async (email: string) => {
    return redis.get(`otp:${email}`);
};

export const deleteOtp = async (email: string) => {
    await redis.del(`otp:${email}`);
};
