import { describe, it, expect, beforeAll } from "vitest";
import { getAPIKey, makeJWT, validateJWT } from "./auth.js"
import { hashPassword, checkPasswordHash } from "./auth.js";
import { Request } from "express";
import { getBearerToken } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
    it("should reject a wrong password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
});
  
});

describe("JWT", () => {
    const userID = "12345";
    const secret = "my-secret";

    it("should create and validate a JWT", () => {
        const token = makeJWT(userID, 3600,secret);

        const result = validateJWT(token, secret);

        expect(result).toBe(userID);
    });

    it("should reject an expired JWT", () => {
    const token = makeJWT(userID,-1,secret);

    expect(() => validateJWT(token, secret)).toThrow();
});

    it("should reject a JWT signed with the wrong secret", () => {
        const token = makeJWT(userID,3600, secret);

        expect(() => validateJWT(token, "wrong-secret")).toThrow();
});

});

describe("Authorization", () => {

    it("should return the bearer token", () => {
    const req = {
        get: (header: string) => {
            if (header === "Authorization") {
                return "Bearer abc123";
            }
            return undefined;
        },
    } as Request;

    const result = getBearerToken(req);

    expect(result).toBe("abc123");
});

it("should throw if Authorization header is missing", () => {
    const req = {
        get: (header: string) => undefined,
    } as Request;

    expect(() => getBearerToken(req)).toThrow();
    });

    it("should return the apikey token", () => {
    const req = {
        get: (header: string) => {
            if (header === "Authorization") {
                return "ApiKey abc123";
            }
            return undefined;
        },
    } as Request;

    const result = getAPIKey(req);

    expect(result).toBe("abc123");
});
it("should throw if Authorization header is missing", () => {
    const req = {
        get: (header: string) => undefined,
    } as Request;

    expect(() => getAPIKey(req)).toThrow();
    });

});
