
import { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

//---------------------------------------------------------------

export function middlewareLogResponses(req: Request, res:Response, next: NextFunction){
    res.on("finish", ()=>{
        //Listen for finished events
        const status = res.statusCode;
        if(status != 200){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`)
        }
    });
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}