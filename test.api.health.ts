import express from "express";
import metricsHealthRoute from "./server/routes/metrics.health.js";

const app = express();
app.use("/api/metrics/health", metricsHealthRoute);

const server = app.listen(3002, async () => {
    try {
        const response = await fetch("http://localhost:3002/api/metrics/health");
        const data = await response.json();
        console.log("HEALTH TEST RESULT:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Health fetch failed:", err);
    } finally {
        server.close();
        process.exit(0);
    }
});
