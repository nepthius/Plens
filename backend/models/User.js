const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    risk: String,
    high: [String],
    med: [String],
    addedAt: { type: Date, default: Date.now },
  });
  

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  favorites: [String],
  watchlist: [String],
  searchHistory: [String],
  products: [ProductSchema], // 🆕 Add this line
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
