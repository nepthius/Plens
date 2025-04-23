const mongoose = require("mongoose");
const ScraperResult = require("../models/ScraperResult");
require("dotenv").config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log("🔍 Finding duplicates...");
  const all = await ScraperResult.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$name",
        docs: { $push: "$$ROOT" }
      }
    },
    {
      $project: {
        keep: { $first: "$docs" },
        remove: { $slice: ["$docs", 1, { $size: "$docs" }] }
      }
    },
    { $unwind: "$remove" },
    { $replaceRoot: { newRoot: "$remove" } }
  ]);

  const duplicateIds = all.map(doc => doc._id);

  console.log("🧽 Finding blank or invalid name entries...");
  const blanks = await ScraperResult.find({
    $or: [
      { name: { $exists: false } },
      { name: null },
      { name: "" },
      { name: /^\s*$/ }
    ]
  }).select("_id");

  const blankIds = blanks.map(doc => doc._id);

  const totalToDelete = [...duplicateIds, ...blankIds];

  const res = await ScraperResult.deleteMany({ _id: { $in: totalToDelete } });

  console.log(`🧹 Removed ${res.deletedCount} entries (duplicates and blanks).`);

  await mongoose.disconnect();
})();
