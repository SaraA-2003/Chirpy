import { chirps, NewChirp } from "../schema.js";
import {db} from "../index.js"
import { eq } from "drizzle-orm";
//---------------------------------------------------------

export async function createChirp (chirp: NewChirp){
    const [newChirp] = await db.insert(chirps).values(chirp).returning();
    return newChirp;
}
export async function getChirps(){
    const chirpsList = await db.select().from(chirps).orderBy(chirps.createdAt)
    return chirpsList;
}
export async function getChirpById (chirpId: string){
    const [chirpRecord] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return chirpRecord;
}