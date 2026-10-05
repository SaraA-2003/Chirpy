import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./customErrors.js";
import { Request } from "express";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string>{
    return await argon2.hash(password)
}
export async function checkPasswordHash(password: string, hash: string): Promise<boolean>{
    return await argon2.verify(hash,password);
}
export function makeJWT(userID: string, expiresIn: number, secret: string): string{
    type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
    const iat = Math.floor(Date.now() / 1000)//sec
    const payload : Payload = {
        iss : "chirpy",
        sub: userID,
        iat : iat,
        exp: iat + expiresIn
    }
    const token = jwt.sign(payload,secret)
    return token;
}

export function validateJWT(tokenString: string, secret: string): string{
    try{
        const payload = jwt.verify(tokenString,secret);
        if(typeof payload === "string" || !payload.sub){
            throw new UnauthorizedError("Invalid Token!")
        }
        return payload.sub
    }
    catch{
        // If the token signature is invalid or the token has expired
        throw new UnauthorizedError("Invalid Token!");
    }
}

export function getBearerToken(req: Request): string{
    const authorization = req.get("Authorization");
    if(!authorization){
        throw new UnauthorizedError("Missing Authorization header");
    }
    return authorization.replace("Bearer","").trim();
}
export function makeRefreshToken():string{
    const random = crypto.randomBytes(32);
    const refreshToken = random.toString("hex");
    return refreshToken;
}

