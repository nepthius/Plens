const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const ScraperResult = require("./models/ScraperResult");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";


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


//user routes
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            passwordHash
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});


app.post("/api/login", async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).json({ message: "Email/Username and password required." });
    }

    try {
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
});

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("username email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
