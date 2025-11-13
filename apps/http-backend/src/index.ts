import express, {Request, Response, type Express} from "express"
import morgan from "morgan"
import dotenv from "dotenv";
import { logError, logInfo } from "@repo/logger";
import { ApiError } from "@repo/logger/error";
import router from "./routes";
dotenv.config();

const app:Express = express();
const port = process.env.PORT || 3001

app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1",router);

app.get("/health",(req:Request,res:Response)=>{
    try {
        return res.status(200).send(`<h1>Hello world!!</h1>`)
        logInfo("HEALTH Route was hit successfully");
    } catch (error) {
        logError(500,`Internal error occured ${error}`)
        throw ApiError.internal();
    }
})

export {app,port};