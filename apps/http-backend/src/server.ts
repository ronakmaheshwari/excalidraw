import cluster from "node:cluster"
import os from "node:os"
import { app, port } from "./index";

const totalCpus = os.cpus().length;

if(cluster.isPrimary){
    for(let i =0;i<totalCpus;i++){
        cluster.fork();
    }
    cluster.on("exit",()=>{
        cluster.fork();
    })
}else{
    app.listen(port,()=>{
        
        console.log(`Server running on port ${port}`)
    })
}