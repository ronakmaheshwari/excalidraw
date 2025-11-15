import { logError } from "@repo/logger";
import dotenv from "dotenv"

dotenv.config();

export const jwtSecret = process.env.JWT_SECRET

if(!jwtSecret){
    logError(500,"JWT Secret was not provided")
}