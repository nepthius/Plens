const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const ScraperResult = require("./models/ScraperResult");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

app.post("/api/submit_product", async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Product name is required!" });
    }

    console.log(`Searching MongoDB for "${name}" (partial match allowed)...`);

    try {
        const existingProducts = await ScraperResult.find({
            name: { $regex: name, $options: "i" } 
        });

        if (existingProducts.length > 0) {
            console.log(`Found ${existingProducts.length} matching products in MongoDB!`);
            return res.json({ message: "Found similar products in database!", results: existingProducts });
        }

        console.log(`No similar products found in database. Running scraper...`);
        const scraperScript = path.join(__dirname, "../scraper/scraper.py");

        exec(`python3 ${scraperScript} "${name}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                return res.status(500).json({ message: "Scraper execution failed" });
            }
            if (stderr) {
                console.error(`Python script error: ${stderr}`);
                return res.status(500).json({ message: "Scraper error occurred" });
            }

            try {
                const results = JSON.parse(stdout);

                await ScraperResult.insertMany(results);
                console.log("Scraper results saved to MongoDB");

                res.json({ message: "Scraper executed successfully!", results });
            } catch (err) {
                console.error("Error saving to MongoDB:", err);
                res.status(500).json({ message: "Failed to save to MongoDB" });
            }
        });

    } catch (error) {
        console.error("Error checking database:", error);
        res.status(500).json({ message: "Database query failed" });
    }
});

app.get("/api/get_scraper_results", async (req, res) => {
    try {
        const results = await ScraperResult.find().sort({ timestamp: -1 }).limit(10);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving results:", error);
        res.status(500).json({ message: "Failed to retrieve results" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
