import { Request,Response, NextFunction } from "express";
import { config } from "./config.js";
//---------------------------------------------------------------------------

export async function handlerReadiness(req: Request, res:Response): Promise<void>{
    res.set("Content-Type", "text/plain; charset=utf-8");
    //Status: 200 by default 
    res.send("OK")

}
export async function handlerPrintFileserverHits(req: Request, res:Response): Promise<void>{
    await res.type("text/plain").send(`Hits: ${config.fileserverHits}`)
}

export async function HandlerReset(req: Request, res:Response): Promise<void>{
        config.fileserverHits =0;
        //Always send a response
        res.send();

}
