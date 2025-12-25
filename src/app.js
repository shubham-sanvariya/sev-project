import express from 'express'
import {responseFormatter} from "./middleware/responseFormatter.js";
import {errorHandler} from "./middleware/errorHandler.js";
import {asyncHandler} from "./utils/asyncHandler.js";
import database from './config/db.js'
import {setupLogger} from "./middleware/logger.js";
import {requestTracker} from "./middleware/requestTracker.js";
import {responseTracker} from "./middleware/responseTracker.js";
import router from "./routes/productRoutes.js";

// process.loadEnvFile();

const app = express();

app.use(express.json());

const startServer = async () => {
    await database.connect();
    const PORT = process.env.PORT;
    app.listen(PORT, (error) => {
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

app.use(router)

app.use(errorHandler)

export default app;
