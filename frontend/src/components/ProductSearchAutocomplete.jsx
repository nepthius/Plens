import { useState, useEffect } from "react";
import axios from "axios";
import { useDebounce } from "useDebounce";

export default function ProductSearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce delay

  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get("/api/autocomplete", {
          params: { q: debouncedQuery }
        });
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
  };

  return (
    <div style={{ position: "relative", maxWidth: "400px", margin: "0 auto" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a product..."
        style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            border: "1px solid #ccc",
            position: "absolute",
            width: "100%",
            background: "#fff",
            zIndex: 10,
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion._id}  // using the MongoDB _id field as key
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
