import express from "express"
import { PORT } from "./constants.js"
import { handlerReadiness, handlerPrintFileserverHits, handlerReset, handlerValidateChirp } from "./handlers.js";
import { middlewareLogResponses, middlewareMetricsInc, errorHandler } from "./middlewares.js";

//-----------------------------------------------------------------------------
//Create express application
const app =express()

app.use(middlewareLogResponses);
 // Built-in middleware to parse JSON request bodies
app.use(express.json());

// Use Express's built-in middleware to serve static files
//app is url prefix
app.use("/app", middlewareMetricsInc,express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerPrintFileserverHits);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerValidateChirp)

// Error handling middleware
app.use(errorHandler);


//Run the server and make it listen for requests on port 8080
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});




