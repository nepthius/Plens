import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [riskFactors, setRiskFactors] = useState([]);

    useEffect(() => {
        axios.get("/api/risk_factors")
            .then((response) => setRiskFactors(response.data.riskFactors))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div>
            <h1>Health Risk Factors</h1>
            <ul>
                {riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
