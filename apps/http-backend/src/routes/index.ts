import { Router } from "express";
import userRouter from "./user";

const router:Router = Router();

interface RouterType {
    path:string,
    router:Router
}

const allRouter: RouterType[] = [
    {
        path: "/user",
        router: userRouter
    }
]

for(const x of allRouter){
    router.use(x.path,x.router);
}

export default router;