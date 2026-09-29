import express from "express"
import { PORT } from "./constants.js"
import { handlerReadiness } from "./handlers.js";

//-----------------------------------------------------------------------------
//Create express application
const app =express()
// Use Express's built-in middleware to serve static files
//app is url prefix
app.use("/app", express.static("./src/app"));
app.get("/healthz", handlerReadiness);

//Run the server and make it listen for requests on port 8080
app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});



