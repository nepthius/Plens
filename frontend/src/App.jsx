import { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [productName, setProductName] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [scraperResults, setScraperResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName) {
            alert("Please enter a product name!");
            return;
        }

        try {
            setResponseMessage("Checking database...");
            const response = await axios.post("/api/submit_product", { name: productName });
            
            setScraperResults(response.data.results);
            setResponseMessage(response.data.message);
            setProductName("");
        } catch (error) {
            console.error("Error sending product:", error);
            setResponseMessage("Failed to fetch product data.");
        }
    };

    const fetchScraperResults = async () => {
        try {
            const response = await axios.get("/api/get_scraper_results");
            setScraperResults(response.data);
        } catch (error) {
            console.error("Error fetching scraper results:", error);
            setScraperResults([]);
        }
    };

    useEffect(() => {
        fetchScraperResults();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Product Risk Analyzer</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    style={{ padding: "10px", marginRight: "10px", fontSize: "16px" }}
                />
                <button type="submit" style={{ padding: "10px", fontSize: "16px" }}>Submit</button>
            </form>

            <h2>{responseMessage}</h2>

            <h2>Stored Results</h2>
            {scraperResults.length > 0 ? (
                <ul>
                    {scraperResults.map((result, index) => (
                        <li key={index}>
                            <strong>{result.name}</strong> - Risk: {result.risk}
                            <ul>
                                {result.high.length > 0 && <li>High-Risk: {result.high.join(", ")}</li>}
                                {result.med.length > 0 && <li>Medium-Risk: {result.med.join(", ")}</li>}
                                {result.high.length === 0 && result.med.length === 0 && <li>Low Risk</li>}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results available.</p>
            )}
        </div>
    );
}

export default App;
