import { logError } from "@repo/logger";
import { ApiError } from "@repo/logger/error";
import { SigninSchema, SignupSchema, UpdateUser, z } from "@repo/types";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { jwtSecret, saltround } from "@repo/common/config";
import { db } from "@repo/db/database";
import userMiddleware from "../middleware.js";
import multer from "multer";
import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv"

dotenv.config()
const userRouter:Router = Router();
const upload = multer();

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const BUCKET = 'avatar'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables')
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const jwt_secret = jwtSecret;
if(!jwt_secret){
    throw ApiError.internal("JWT Secret was missing");
}

const rounds = saltround
if(!rounds){
    throw ApiError.internal("SALTROUND missing")
}

function getStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split("/object/public/")[1];
    return parts; // e.g., "avatars/123.png"
  } catch {
    return null;
  }
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

userRouter.post("/create-room",userMiddleware,async(req:Request,res:Response)=>{
    try {
        const userId = req.userId
    } catch (error) {
        logError(500,`[USER SIGNIN]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

userRouter.post("/avatar", userMiddleware, upload.single('file') , async(req:Request,res:Response) =>{
    try {
        const userId = req.userId;
        const file = req.file as Express.Multer.File;

        if(!file){
            throw ApiError.notFound("No file was provided")
        }

        const findName = await db.user.findUnique({where:{id: userId}});

        const filePath = `avatars/${findName?.name}-${Date.now()}`;
        const {error: uploadError} = await supabase.storage.from(BUCKET).upload(filePath,file.buffer,{
            contentType: file.mimetype,
            upsert: true
        })

        if (uploadError) {
            console.error(uploadError);
            throw new ApiError(400,"File couldn't be uploaded to the cloud")
        }

        const {data: urlData} = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;
        await db.user.update({
            where:{
                id: userId
            },
            data:{
                avatarUrl: publicUrl
            }
        })
        res.json({
            message: "Avatar uploaded successfully",
            avatarUrl: publicUrl,
        });
    } catch (error) {
        logError(500,`[USER AddAvatar]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

userRouter.patch("/profile", userMiddleware, upload.single('file'), async(req: Request,res: Response) =>{
    try {
        const userId = req.userId;
        const parsedData = UpdateUser.safeParse(req.body);
        if(!parsedData.success){
            const pretty = z.prettifyError(parsedData.error)
            logError(400,`[USER Patch Profile]: Invalid data was provided`);
            throw new ApiError(402,pretty);
        }
        const body = parsedData.data;
        const file = req.file as Express.Multer.File
        let newAvatarUrl: string | undefined;

        const findAvatar = await db.user.findUnique({
            where:{
                id: userId
            },
            select: { avatarUrl: true , name: true},
        })

        if(file){
            if(findAvatar?.avatarUrl){
                const oldPath = getStoragePath(findAvatar.avatarUrl);
                if (oldPath) {
                    await supabase.storage.from("avatars").remove([oldPath]);
                }
            }
        }
        const filePath = `avatars/${findAvatar?.name}-${Date.now()}`;
        const {error: uploadError} = await supabase.storage.from(BUCKET).upload(filePath,file?.buffer,{
            contentType: file?.mimetype,
            upsert: false
        })

        if (uploadError) {
          console.error(uploadError);
          throw new ApiError(500, "Avatar upload failed.");
        }

        const {data: urlData} = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl

        const updateUser = await db.user.update({
            where:{
                id: userId
            },
            data:{
                ...body,
                ...(newAvatarUrl ? {avatarUrl: newAvatarUrl} : {})
            }
        })

        return res.status(200).json({
            error: false,
            msg: "User details were successfully changed",
            data: updateUser
        })
    } catch (error) {
        logError(500,`[USER Patch PROFILE]: error taken place ${error}`)
        throw ApiError.internal();
    }
})

userRouter.get("/profile", userMiddleware, async(req: Request,res:Response) =>{
    try {
        const userId = req.userId;
        const findUser = await db.user.findUnique({
            where:{
                id: userId
            },
            select:{
                name: true,
                password: true,
                avatarUrl: true
            }
        })
        if(!findUser){
            throw ApiError.unauthorized("The userId was invalid")
        }
        
        return res.status(200).json({
            error: false,
            msg: "User Data successfully fetched",
            data: findUser
        })
    } catch (error) {
        logError(500,`[USER GET PROFILE]: error taken place ${error}`)
        throw ApiError.internal();
    }
})


export default userRouter;