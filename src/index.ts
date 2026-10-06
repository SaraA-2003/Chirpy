import express from "express"
import { handlerReadiness, handlerPrintFileserverHits, handlerReset, handlerLogin, handlerRefresh, handlerRevoke, handlerUpdateUser, handlerDeleteChirpById, handlerWebhooks } from "./handlers.js";
import { handlerCreateUser, handlerCreateChirp , handlerGetChirps, handlerGetChirpById} from "./handlers.js";
import { middlewareLogResponses, middlewareMetricsInc, errorHandler } from "./middlewares.js";
import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
//-----------------------------------------------------------------------------
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
//Create express application
const app =express()
app.use(middlewareLogResponses);
 // Built-in middleware to parse JSON request bodies
app.use(express.json());

// Use Express's built-in middleware to serve static files
//app is url prefix
app.use("/app", middlewareMetricsInc,express.static("./src/app"));

//HTTP requests
//GET
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerPrintFileserverHits);
app.get("/api/chirps/", handlerGetChirps);
app.get("/api/chirps/:chirpId",handlerGetChirpById);

//POST
app.post("/admin/reset", handlerReset);
app.post("/api/chirps", handlerCreateChirp);
app.post("/api/users", handlerCreateUser);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.post("/api/polka/webhooks",handlerWebhooks);

//PUT
app.put("/api/users", handlerUpdateUser);

//DELETE
app.delete("/api/chirps/:chirpId",handlerDeleteChirpById);






// Error handling middleware
app.use(errorHandler);

//Run the server and make it listen for requests on port 8080
const PORT = config.api.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});




