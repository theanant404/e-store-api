import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_TTL: SignOptions["expiresIn"] = (process.env.ACCESS_TOKEN_TTL ?? "15m") as SignOptions["expiresIn"];
const REFRESH_TOKEN_TTL: SignOptions["expiresIn"] = (process.env.REFRESH_TOKEN_TTL ?? "7d") as SignOptions["expiresIn"];
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

export type JwtPayload = {
    _id: string;
    role: string;
    email: string;
    isBlocked?: boolean;
};

export const signAccessToken = (payload: JwtPayload, expiresIn: SignOptions["expiresIn"] = ACCESS_TOKEN_TTL) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn });
};

export const signRefreshToken = (payload: JwtPayload, expiresIn: SignOptions["expiresIn"] = REFRESH_TOKEN_TTL) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};
