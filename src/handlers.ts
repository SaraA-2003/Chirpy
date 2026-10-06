import { Request,Response, NextFunction } from "express";
import { config } from "./config.js";
import { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from "./customErrors.js";
import {createUser, deleteUsers, getUserByEmail, updateUser, updateUserChirpyRedUsingId} from "./db/queries/users.js";
import { createChirp, getChirps , getChirpById, deleteChirpById, getChirpByUserId} from "./db/queries/chirps.js";
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, validateJWT, makeRefreshToken, getAPIKey} from "./auth.js";
import { UserResponse } from "./db/schema.js";
import { createRefreshToken, getRefreshTokenByToken, UpdateRefreshToken } from "./db/queries/refresh_tokens.js";

//Global
const expireInt = 3600; //1h
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
    if (config.api.PLATFORM !== "dev"){
      throw new ForbiddenError ("403 Forbidden");
    }
      config.api.fileserverHits =0;
      await deleteUsers();
      //Always send a response
      res.send();
}
//------------------- Users -------------------
export async function handlerCreateUser(req: Request, res:Response): Promise<void>{
  validateRequestBody(req);
  validateEmailAndPassword(req);
  const newUser = await createUser({
  email: req.body.email,
  hashedPassword: await hashPassword(req.body.password)
  });
  res.status(201).json(newUser);
}

export async function handlerLogin(req: Request, res:Response): Promise<void>{
  validateRequestBody(req);
  validateEmailAndPassword(req);
  const user = await getUserByEmail(req.body.email);
  if (!user || !(await checkPasswordHash(req.body.password, user.hashedPassword))) {
      throw new UnauthorizedError("incorrect email or password");
  }
  const accessToken = makeJWT(user.id, expireInt, config.api.SECRET);
  const refreshToken = makeRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);//60 days from now
  const refreshTokenRecord = await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: expiresAt
  });
  const {hashedPassword, ...userResponse} = user;
  res.status(200).json({
    ...userResponse,
    token:accessToken,
    refreshToken: refreshToken
  });
}

export async function handlerRefresh(req: Request, res:Response): Promise<void>{
  const refreshToken = getBearerToken(req);
  const refreshTokenRecord = await getRefreshTokenByToken(refreshToken);
  const now = new Date();
  if(!refreshTokenRecord || refreshTokenRecord.revokedAt != null || refreshTokenRecord.expiresAt < now)
    throw new UnauthorizedError("Invalid refresh token");

  const accessToken = makeJWT(refreshTokenRecord.userId, expireInt, config.api.SECRET);
  res.status(200).json({
    token: accessToken
  });
}

export async function handlerRevoke(req: Request, res:Response): Promise<void>{
    const refreshToken = getBearerToken(req);
    const refreshTokenRecord = await getRefreshTokenByToken(refreshToken);
    const now = new Date();
     if(!refreshTokenRecord || refreshTokenRecord.revokedAt != null || refreshTokenRecord.expiresAt < now){
        throw new UnauthorizedError("Invalid refresh token");
     }
     await UpdateRefreshToken(refreshToken);
     res.status(204).send();
}

export async function handlerUpdateUser(req: Request, res:Response): Promise<void>{
    validateRequestBody(req);
    validateEmailAndPassword(req);
    const accessToken = getBearerToken(req);
    const userId = validateJWT(accessToken, config.api.SECRET);
    const hashedPass = await hashPassword(req.body.password);
    const updatedUser = await updateUser(userId, {
      email: req.body.email,
      hashedPassword: hashedPass
    });
    const {hashedPassword, ...userResponse} = updatedUser;
    res.status(200).json(userResponse);
}



//-------------- Chirps -------------------
export async function handlerCreateChirp(req: Request, res:Response): Promise<void>{
    validateRequestBody(req);
    if(!("body" in req.body)){
      throw new BadRequestError("Missing 'body' field in request body");
    }
    if(typeof req.body.body !== "string"){
      throw new BadRequestError("'body' field must be a string");
    }
    if(req.body.body.length > 140){
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.SECRET);
    const chirpBody = req.body.body;
    const arrayChirp = chirpBody.split(" ");

    for (let i =0 ; i< arrayChirp.length; i++){
      if(arrayChirp[i].toLowerCase() === "kerfuffle" || arrayChirp[i].toLowerCase() === "sharbert" || arrayChirp[i].toLowerCase() === "fornax"){
        arrayChirp[i] = "****";
    }
  }
    const cleanedChirp : string= arrayChirp.join(" ");
    console.log(req.body);
    const newChirp = await createChirp({
      body: cleanedChirp,
      userId: userId
    });
    res.status(201).json(newChirp)
}
export async function handlerGetChirps(req: Request, res:Response): Promise<void>{
  let sort = "asc";
  let sortQuery = req.query.sort;
  if (typeof sortQuery === "string") {
    sort = sortQuery;
  }
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }
  if(!authorId){
    const chirps = await getChirps();
    if(sort == "asc")
    {
      chirps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    else{
      chirps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    res.status(200).json(chirps);
    return;
  }
  const chirpList = await getChirpByUserId(authorId);
  if(sort == "asc")
    {
      chirpList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    else{
      chirpList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  res.status(200).json(chirpList);
}

export async function handlerGetChirpById(req: Request, res:Response): Promise<void>{
  const chirpId = req.params.chirpId;
  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
}
  const chirpRecord = await getChirpById(chirpId); 
    console.log(chirpRecord)

  if(!chirpRecord){
    throw new NotFoundError(`Chirp with id : ${chirpId} not found!`)
  }
  res.status(200).json(chirpRecord);
}

export async function handlerDeleteChirpById(req: Request, res:Response): Promise<void>{
    const accessToken = getBearerToken(req);
    const userId = validateJWT(accessToken, config.api.SECRET);
    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
      throw new BadRequestError("Invalid chirp ID");
    }
     const chirpRecord = await getChirpById(chirpId); 
    console.log(chirpRecord)

  if(!chirpRecord){
    throw new NotFoundError(`Chirp with id : ${chirpId} not found!`)
  }
  if(userId != chirpRecord.userId ){
    throw new ForbiddenError("You do not have permission to delete this chirp")
  }

  await deleteChirpById(chirpId);
  res.status(204).send();
}

//-------------------------------Webhook---------------------------------------
export async function handlerWebhooks(req: Request, res:Response): Promise<void>{
  const apiKey = getAPIKey(req);
  if(apiKey != config.api.POLKA_KEY){
    throw new UnauthorizedError("Invalid API Key");
  }
  validateRequestBody(req);
  if(!("event" in req.body)){
    throw new BadRequestError("Missing 'event' field in request body");
  }
  if(typeof req.body.event !== "string"){
    throw new BadRequestError("'event' field must be a string");
  }
  if(!("data" in req.body)){
    throw new BadRequestError("Missing 'data' field in request body");
  }
    if(typeof req.body.data !== "object"){
    throw new BadRequestError("'data' field must be an object");
  }
  if(!("userId" in req.body.data)){
    throw new BadRequestError("Missing 'userId' field inside data field");
  }
  if(typeof req.body.data.userId !== "string"){
    throw new BadRequestError("'userId' field must be a string");
  }

  if(req.body.event != "user.upgraded"){
    res.status(204).send();
    return;
  }
  const updatedUser = await updateUserChirpyRedUsingId(req.body.data.userId)
  if(!updatedUser){
    throw new NotFoundError("User not found!");
  }
  res.status(204).send();
}





//--------------------------------Helper Functions---------------------------------------
function validateRequestBody(req: Request): void {
  if (!req.body) {
    throw new BadRequestError("Missing request body");
  }
  if (typeof req.body !== "object") {
    throw new BadRequestError("Request body must be a JSON object");
  }
}
function validateEmailAndPassword(req: Request): void {
    if (!("email" in req.body)) {
        throw new BadRequestError("Missing 'email' field in request body");
    }
    if (typeof req.body.email !== "string") {
        throw new BadRequestError("'email' field must be a string");
    }

    if (!("password" in req.body)) {
        throw new BadRequestError("Missing 'password' field in request body");
    }
    if (typeof req.body.password !== "string") {
        throw new BadRequestError("'password' field must be a string");
    }
}