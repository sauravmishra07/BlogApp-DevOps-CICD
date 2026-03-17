import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    bio: string;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
             res.status(401).json({
                message: "❌ Please Login -- No token"
            });
            return;
        }

        const token = authHeader.split(" ")[1] as string;
        
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({
                message: "❌ Server configuration error"
            });
            return;
        }

        const decodedValue = jwt.verify(token, jwtSecret as string) as JwtPayload;

        if (!decodedValue) {
            res.status(401).json({
                message: "❌Please Login -- Invalid token"
            });
            return;
        }

        req.user = decodedValue.user;
        next();
    } 
    catch (error: any) {
        console.error("Authentication Error:", error);
        res.status(401).json({
            message: "❌ Please Login -- JWT error"
        });
    }
}