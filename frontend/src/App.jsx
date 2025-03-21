import { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

function App() {
    const [productName, setProductName] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [scraperResults, setScraperResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("None");

    const resultsPerPage = 5;

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
            setCurrentPage(1); 
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

    const getRiskLevel = (result) => {
        if (result.high.length > 0) return "High";
        if (result.med.length > 0) return "Medium";
        return "Low";
    };

    let filteredResults = scraperResults.filter((result) => {
        const level = getRiskLevel(result);
        return filter === "All" || level === filter;
    });

    if (sortOrder === "LowToHigh") {
        const riskWeight = { Low: 1, Medium: 2, High: 3 };
        filteredResults.sort((a, b) => riskWeight[getRiskLevel(a)] - riskWeight[getRiskLevel(b)]);
    } else if (sortOrder === "HighToLow") {
        const riskWeight = { Low: 1, Medium: 2, High: 3 };
        filteredResults.sort((a, b) => riskWeight[getRiskLevel(b)] - riskWeight[getRiskLevel(a)]);
    }

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
    const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

    return (
        <div className="app-container">
            <h1>🔎 Product Risk Analyzer</h1>

            <form onSubmit={handleSubmit} className="form-container">
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="input-field"
                />
                <button type="submit" className="submit-button">Submit</button>
            </form>

            <h2 className="response-message">{responseMessage}</h2>

            <h2 className="results-header">Search Results</h2>

            {/* Filter + Sort Controls */}
            <div className="filter-sort-container">
                <div className="filter-dropdown">
                    <label>Filter by Risk: </label>
                    <select value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="All">All</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="sort-dropdown">
                    <label>Sort by Risk: </label>
                    <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}>
                        <option value="None">None</option>
                        <option value="LowToHigh">Low → High</option>
                        <option value="HighToLow">High → Low</option>
                    </select>
                </div>
            </div>

            {scraperResults.length > 0 ? (
                <div className="results-container">
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Risk Level</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentResults.map((result, index) => {
                                const riskLevel = getRiskLevel(result);

                                return (
                                    <tr key={index} className={`risk-${riskLevel.toLowerCase()}`}>
                                        <td>{result.name}</td>
                                        <td>{riskLevel}</td>
                                        <td>
                                            {result.high.length > 0 && (
                                                <div><strong>High-Risk:</strong> {result.high.join(", ")}</div>
                                            )}
                                            {result.med.length > 0 && (
                                                <div><strong>Medium-Risk:</strong> {result.med.join(", ")}</div>
                                            )}
                                            {result.high.length === 0 && result.med.length === 0 && (
                                                <div><strong>Low Risk</strong></div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="page-indicator">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <p>No results available.</p>
            )}
        </div>
    );
}

export default App;
