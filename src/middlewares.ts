
import { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from "./customErrors.js";

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
    config.api.fileserverHits++;
    next();
}

export function middlewareParseJson(req: Request, res: Response, next: NextFunction) {
    // 1. Initialize
    let body ="";
    // 2. Listen for data events
    req.on("data", (chunk) =>{
        body +=chunk;
    })
    // 3. Listen for end events
    req.on("end", ()=>{
        try{
            const parsedJson = JSON.parse(body);
            // Attach the parsed JSON to the request object for further processing
            req.body = parsedJson;
            next();
        }
        catch(err){
            res.status(400).send("Invalid JSON");
        }
    })
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
    } else if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
    } else if (err instanceof ForbiddenError) {
        res.status(403).json({ error: err.message });
    } else if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
    }
    else {
        console.error("Something went wrong on our end");
        res.status(500).json({ error: "Something went wrong on our end"});
    }
}
