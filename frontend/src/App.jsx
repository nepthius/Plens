import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("/api/risk_factors")
            .then((response) => setMessage(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <div>
            <h1>REACTTTTTTTTTTT</h1>
            <p>Backend having a funny thing to say: {message}</p>
        </div>
    );
}

export default App;
