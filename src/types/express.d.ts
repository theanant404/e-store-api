import { JwtPayload } from "../lib/jwt";

declare global {
    namespace Express {
        interface User extends JwtPayload { }
        interface Request {
            user?: User;
            files?: MulterFiles;
        }
        type MulterFiles = Express.Multer.File[] | Record<string, Express.Multer.File[]>;
    }
}

export { };
