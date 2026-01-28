import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from "../app";

export default async (req: VercelRequest, res: VercelResponse) => {
    return app(req, res);
};