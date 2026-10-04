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
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerReset(req: Request, res:Response): Promise<void>{
        config.fileserverHits =0;
        //Always send a response
        res.send();

}

export async function handlerValidateChirp(req: Request, res:Response): Promise<void>{
    res.header("Content-Type", "application/json");
    if(!req.body ){
      const error : ResponseErrorBody = { error: "Missing request body" };
      const body = JSON.stringify(error);
      res.status(400).send(body);
      return;
    }
    if(typeof req.body !== "object"){
      const error : ResponseErrorBody = { error: "Request body must be a JSON object" };
      const body = JSON.stringify(error);
      res.status(400).send(body);
      return;
    }
    if(!("body" in req.body)){
      const error : ResponseErrorBody = { error: "Missing 'body' field in request body" };
      const body = JSON.stringify(error);
      res.status(400).send(body);
      return;
    }
    if(typeof req.body.body !== "string"){
      const error : ResponseErrorBody = { error: "'body' field must be a string" };
      const body = JSON.stringify(error);
      res.status(400).send(body);
      return;
    }
    if(req.body.body.length > 140){
      throw new Error("Chirp body exceeds 140 characters");
    }

    const chirpBody = req.body.body;
    const arrayChirp = chirpBody.split(" ");

    for (let i =0 ; i< arrayChirp.length; i++){
      if(arrayChirp[i].toLowerCase() === "kerfuffle" || arrayChirp[i].toLowerCase() === "sharbert" || arrayChirp[i].toLowerCase() === "fornax"){
        arrayChirp[i] = "****";
    }
  }
    const cleanedChirp : string= arrayChirp.join(" ");
    res.status(200).send(JSON.stringify({ cleanedBody: cleanedChirp}));
}
