import type { MigrationConfig} from "drizzle-orm/migrator";

// Load environment variables from .env file
process.loadEnvFile()

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

type DBConfig = {
 url: string;
 migrationConfig: MigrationConfig;
};

type APIConfig = {
  fileserverHits: number;
  PORT: number;
};
type Config = {
  api: APIConfig;
  db: DBConfig;
};


export const config : Config ={
    api:{
      fileserverHits: 0,
      PORT: parseInt(envOrThrow("PORT"), 10)
    },

    db:{
      url: envOrThrow("DB_URL"),
      migrationConfig: migrationConfig
    }
};

//------------------------------------------------

export function envOrThrow(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}
