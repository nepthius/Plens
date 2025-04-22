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
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if we can't connect to MongoDB
    });

app.post("/api/submit_product", async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Product name is required!" });
    }

    try {
        const existingProducts = await ScraperResult.find({
            name: { $regex: name, $options: "i" } 
        });

        if (existingProducts.length > 0) {
        }

        if (existingProducts.length > 0) {
            return res.json({ message: "Found similar products in database!", results: existingProducts });
        }

        const scraperScript = path.join(__dirname, "../scraper/scraper.py");

        exec(`python3 "${scraperScript}" "${name}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`[ERROR] Scraper execution failed:`, error);
                return res.status(500).json({ message: "Scraper execution failed" });
            }
            if (stderr) {
                console.error(`[ERROR] Scraper stderr:`, stderr);
                return res.status(500).json({ message: "Scraper error occurred" });
            }

            try {
                const results = JSON.parse(stdout);

                const savedResults = await ScraperResult.insertMany(results);
            
                if (savedResults.length > 0) {
                    res.json({ message: "Scraper executed successfully!", results: savedResults });
                } else {
                    console.error("[ERROR] No results were saved to MongoDB");
                    res.status(500).json({ message: "Failed to save any results to MongoDB" });
                }
            } catch (err) {
                console.error("[ERROR] Error processing scraper results:", err);
                res.status(500).json({ message: "Failed to process scraper results" });
            }
        });

    } catch (error) {
        console.error("[ERROR] Database query failed:", error);
        res.status(500).json({ message: "Database query failed" });
    }
});

app.get("/api/get_scraper_results", async (req, res) => {
    try {
        const results = await ScraperResult.find().sort({ timestamp: -1 }).limit(10);
        if (results.length > 0) {
        }
        res.json(results);
    } catch (error) {
        console.error("[ERROR] Failed to retrieve results:", error);
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

        res.json({ 
            message: "Login successful", 
            token,
            username: user.username,
            email: user.email,
            userId: user._id
        });
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

//product
app.post("/api/user/products", authMiddleware, async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Product name is required." });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const existingMatch = await ScraperResult.findOne({
            name: { $regex: name, $options: "i" }
        });

        let productToSave;

        if (existingMatch) {
            console.log("Using cached scraper result");
            productToSave = {
                name: existingMatch.name,
                risk: existingMatch.risk,
                high: existingMatch.high,
                med: existingMatch.med,
            };
        } else {
            console.log("No cached result. Running scraper...");
            const scraperScript = path.join(__dirname, "../scraper/scraper.py");

            const output = await new Promise((resolve, reject) => {
                exec(`python "${scraperScript}" "${name}"`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        return reject(error || stderr);
                    }
                    resolve(stdout);
                });
            });

            const results = JSON.parse(output);
            const scraped = results[0];

            const scrapedToSave = {
                name: scraped.name,
            };

            await ScraperResult.create(scrapedToSave);

            productToSave = {
                name: scraped.name || name,
                risk: scraped.risk,
                high: scraped.high,
                med: scraped.med,
            };
        }

        user.products.push(productToSave);
        await user.save();

        res.status(201).json({ message: "Product added", product: productToSave });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: "Server error." });
    }
});



app.get("/api/user/products", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ products: user.products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Failed to retrieve products." });
    }
});

app.delete("/api/user/products/:productId", authMiddleware, async (req, res) => {
    const { productId } = req.params;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found." });
        user.products = user.products.filter(
            (product) => product._id.toString() !== productId
        );

        await user.save();
        res.json({ message: "Product deleted successfully." });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Failed to delete product." });
    }
});

app.get("/api/products/alternatives", async (req, res) => {
    const { name, currentRisk } = req.query;
  
    if (!name || !currentRisk) {
      return res.status(400).json({ message: "Missing name or currentRisk." });
    }
  
    const riskRank = { low: 1, medium: 2, high: 3 };
    const words = name.toLowerCase().split(" ");
    const categoryKeywords = ["mask", "serum", "cleanser", "oil", "toner", "moisturizer", "facemask", "gel", "exfoliator", "cream"];
    const detectedCategory = words.find((word) =>
      categoryKeywords.some((cat) => word.includes(cat))
    );
    const category = detectedCategory || words.find((w) => w.length > 5) || words[words.length - 1];
  
    console.log("Searching alternatives in category:", category);
  
    try {
      const lowerRiskProducts = await ScraperResult.find({
        risk: { $ne: currentRisk },
        name: { $regex: new RegExp(category, "i") }
      });
  

      const filtered = lowerRiskProducts.filter(
        (p) => riskRank[p.risk] < riskRank[currentRisk]
      );
  
      if (filtered.length > 0) {
        return res.json({ results: filtered.slice(0, 5) });
      }
  
      console.log("No alternatives found in DB. Running scraper...");
  
      const scraperScript = path.join(__dirname, "../scraper/scraper.py");
      const output = await new Promise((resolve, reject) => {
        exec(`python "${scraperScript}" "${name}"`, (error, stdout, stderr) => {
          if (error || stderr) {
            return reject(error || stderr);
          }
          resolve(stdout);
        });
      });
  
      const scraped = JSON.parse(output);

      const saferScraped = scraped.filter(
        (p) => riskRank[p.risk.toLowerCase()] < riskRank[currentRisk.toLowerCase()]
      );
  
      if (saferScraped.length > 0) {
          const resultsToSave = saferScraped.map(result => ({
              name: result.name,
              risk: result.risk,
              high: result.high,
              med: result.med
          }));
          await ScraperResult.insertMany(resultsToSave);
      }
  
      res.json({ results: saferScraped.slice(0, 5) });
    } catch (err) {
      console.error("Alternative search error:", err);
      res.status(500).json({ message: "Failed to find alternatives." });
    }
  });
  
  



const PORT = process.env.PORT || 3001;
console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});