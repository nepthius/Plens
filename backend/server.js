const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Howdy Plens!");
});

app.get("/api/risk_factors", (req, res) => {
    res.json({
        riskFactors: ["Facemaks A'pieu is high risk!", "Facemask Bertho is low risk...", "Facemask Ableu is Medium Risk."],
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
