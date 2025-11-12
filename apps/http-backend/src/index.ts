import express, {Request, Response, type Express} from "express"
import morgan from "morgan"
import dotenv from "dotenv";
dotenv.config();

const app:Express = express();
const port = process.env.PORT || 3001

app.use(morgan("dev"));

app.get("/health",(req:Request,res:Response)=>{
    try {
        return res.status(200).send(`<h1>Hello world!!</h1>`)
    } catch (error) {
        console.error(`[HTTP Health]: ${error}`)
    }
})

export {app,port};