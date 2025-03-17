const mongoose = require("mongoose");

const ScraperResultSchema = new mongoose.Schema({
    name: String,
    risk: String,
    high: [String],
    med: [String],
    image: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ScraperResult", ScraperResultSchema);
