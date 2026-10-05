import { db } from "../index.js";
import { refreshTokens, NewRefreshToken } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createRefreshToken(refreshToken: NewRefreshToken){
    const [newRefreshToken] = await db.insert(refreshTokens).values(refreshToken).returning();
    return newRefreshToken;
}

export async function getRefreshTokenByToken(token:string){
    const [record] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return record;
}

export async function UpdateRefreshToken(token:string){
    await db.update(refreshTokens).set({
        revokedAt: new Date(),
    }).where(eq(refreshTokens.token, token));
}
