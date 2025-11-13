import { logError } from "@repo/logger";
import { ApiError } from "@repo/logger/error";
import { SigninSchema, SignupSchema, z } from "@repo/types";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt"

const userRouter:Router = Router();

userRouter.post("/signup",async(req:Request,res:Response)=>{
    try {
        const parsedData = SignupSchema.safeParse(req.body);
        
        if(!parsedData.success){
            const pretty = z.prettifyError(parsedData.error);
            logError(400,`USER SIGNUP: Invalid data was provided`);
            throw new ApiError(400,pretty);
        }
        const {name,email,password} = parsedData.data;
        const findEmail = "";

    } catch (error) {
        logError(500,`[USER SIGNUP]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

userRouter.post("/signin",async(req:Request,res:Response)=>{
    try {
        const parsedData = SigninSchema.safeParse(req.body);
        if(!parsedData.success){
            const pretty = z.prettifyError(parsedData.error);
            logError(400,`[USER SIGNIN]: Invalid data was provided`);
            throw new ApiError(400,pretty);
        }
        const {email,password} = parsedData.data;
    } catch (error) {
        logError(500,`[USER SIGNIN]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

userRouter.post("/room",async(req:Request,res:Response)=>{
    try {
        
    } catch (error) {
        logError(500,`[USER SIGNIN]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

export default userRouter;