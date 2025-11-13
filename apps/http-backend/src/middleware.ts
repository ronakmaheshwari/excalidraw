import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { ApiError } from "@repo/logger/error"
import { NextFunction, Request, Response } from "express"
import { logError } from "@repo/logger"

dotenv.config()

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            organiserId?: string;
            token?: string;
        }
    }
}

const jwtSecret = process.env.JWT_SECRET

if(!jwtSecret){
    logError(500,"JWT Secret was not provided in HTTP backend");
    throw ApiError.internal(`JWT_SECRET KEY was not provided`);
}

export default async function userMiddleware(req:Request,res:Response,next:NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            logError(404,"Unauthroized user tried to access");
            throw ApiError.unauthorized();
        }
        const token = authHeader.split(" ")[1];

        if(!token || !jwtSecret){
            logError(404,"Unauthroized user tried to access");
            throw ApiError.unauthorized();
        }

        let decoded:JwtPayload;
        try {
            decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        }catch(error){
            logError(404,"Unauthroized user tried to access");
            throw ApiError.unauthorized();
        }

        const userId = decoded.userId as string;

        if(!userId){
            logError(404,"Unauthroized user tried to access");
            throw ApiError.notFound()
        }
        
    } catch (error) {
        logError(500,"HTTP User Middleware faced an error");
        throw ApiError.internal(`${error}`);
    }
}