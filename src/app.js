import express from 'express'
import {responseFormatter} from "./middleware/responseFormatter.js";
import {errorHandler} from "./middleware/errorHandler.js";
import {asyncHandler} from "./utils/asyncHandler.js";
import database from 'config/db.js'
import {setupLogger} from "./middleware/logger.js";
import {requestTracker} from "./middleware/requestTracker.js";
import {responseTracker} from "./middleware/responseTracker.js";

const app = express();

const startServer = async () => {
    await database.connect();

    app.listen(4000, (error) => {
        if (!error)
            console.log(`🚀 Server running on port ${PORT}`);
        else
            console.log("Error occurred, server can't start", error);
    })
}

(async () => {
    try {
        await startServer();
    } catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
})();

setupLogger(app);
app.use(requestTracker);
app.use(responseTracker);


app.use(responseFormatter)

app.get("/test/api", asyncHandler(async (req,res) => {
    // db work CRUD if fails global errorHandler will catch it
    res.sendResponse(200,"hello test req", "success")
}))

app.use(errorHandler)


export default app;
