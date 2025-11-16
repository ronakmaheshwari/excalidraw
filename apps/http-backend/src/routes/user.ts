import { logError } from "@repo/logger";
import { ApiError } from "@repo/logger/error";
import { SigninSchema, SignupSchema, z } from "@repo/types";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { jwtSecret, saltround } from "@repo/common/config";
import { db } from "@repo/db/database";

const userRouter:Router = Router();

const jwt_secret = jwtSecret;

if(!jwt_secret){
    throw ApiError.internal("JWT Secret was missing");
}

const rounds = saltround

if(!rounds){
    throw ApiError.internal("SALTROUND missing")
}

userRouter.post("/signup",async(req:Request,res:Response)=>{
    try {
        const parsedData = SignupSchema.safeParse(req.body);
        
        if(!parsedData.success){
            const pretty = z.prettifyError(parsedData.error);
            logError(400,`USER SIGNUP: Invalid data was provided`);
            throw new ApiError(400,pretty);
        }
        const {name,email,password} = parsedData.data;

        const findEmail = await db.user.findUnique({
            where:{
                email
            }
        })

        if(findEmail){
            throw new ApiError(400,`The email ${email} provided already exists`)
        }
        const hashedPassword =await bcrypt.hash(rounds,password);

        const createUser = await db.user.create({
            data:{
                name,
                email,
                password: hashedPassword
            }
        })
        const token = jwt.sign({userId:createUser.id},jwt_secret);
        return res.status(200).json({
            error: false,
            msg:"User was successfully created",
            token:token
        })
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
        const findEmail = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!findEmail){
            throw ApiError.notFound("The provided email doesn't exist")
        }
        const comparePassword = await bcrypt.compare(password,findEmail.password);
        if(!comparePassword){
            throw new ApiError(400,'Invalid password was provided')
        }
        const token = jwt.sign({userId: findEmail.id},jwt_secret);
        return res.status(200).json({
            error: false,
            msg:"User successfully logged in",
            token: token
        })
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