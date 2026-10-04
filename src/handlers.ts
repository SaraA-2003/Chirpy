import { Request,Response, NextFunction } from "express";
import { config } from "./config.js";
import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from "./customErrors.js";

//---------------------------------------------------------------------------
type ResponseErrorBody ={
  error : string;
}
//----------------------------------------------------------------------------
export async function handlerReadiness(req: Request, res:Response): Promise<void>{
    res.set("Content-Type", "text/plain; charset=utf-8");
    //Status: 200 by default 
    res.send("OK")

}
export async function handlerPrintFileserverHits(req: Request, res:Response): Promise<void>{
    await res.type("text/html; charset=utf-8").send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerReset(req: Request, res:Response): Promise<void>{
        config.api.fileserverHits =0;
        //Always send a response
        res.send();

}

export async function handlerValidateChirp(req: Request, res:Response): Promise<void>{
    if(!req.body ){
      throw new BadRequestError("Missing request body");
    }
    if(typeof req.body !== "object"){
      throw new BadRequestError("Request body must be a JSON object");
    }
    if(!("body" in req.body)){
      throw new BadRequestError("Missing 'body' field in request body");
    }
    
    if(typeof req.body.body !== "string"){
      throw new BadRequestError("'body' field must be a string");
    }
    if(req.body.body.length > 140){
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const chirpBody = req.body.body;
    const arrayChirp = chirpBody.split(" ");

    for (let i =0 ; i< arrayChirp.length; i++){
      if(arrayChirp[i].toLowerCase() === "kerfuffle" || arrayChirp[i].toLowerCase() === "sharbert" || arrayChirp[i].toLowerCase() === "fornax"){
        arrayChirp[i] = "****";
    }
  }
    const cleanedChirp : string= arrayChirp.join(" ");
    res.header("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({ cleanedBody: cleanedChirp}));
}
