import { db } from "../index.js";
import { NewUser, users, UserResponse } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  //Omit hashedPassword from result
    const {hashedPassword, ...userResponse} = result;
  return userResponse ;
}
export async function deleteUsers (){
  await db.delete(users);
}

export async function getUserByEmail(email:string){
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function updateUser(userId: string,user:NewUser){
  const [record] = await db.update(users).set({
    hashedPassword: user.hashedPassword,
    email: user.email
  }).where(eq(users.id,userId)).returning();
  return record;
}
