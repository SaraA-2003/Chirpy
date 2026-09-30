import express from "express"
import { PORT } from "./constants.js"
import { handlerReadiness, handlerPrintFileserverHits, HandlerReset} from "./handlers.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./middlewares.js";

//-----------------------------------------------------------------------------
//Create express application
const app =express()

app.use(middlewareLogResponses);
// Use Express's built-in middleware to serve static files
//app is url prefix
app.use("/app", middlewareMetricsInc,express.static("./src/app"));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerPrintFileserverHits);
app.get("/reset", HandlerReset);



//Run the server and make it listen for requests on port 8080
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});




