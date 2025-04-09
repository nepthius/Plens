import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"
import IngredientTooltip from "../components/IngredientTooltip";

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [savedProducts, setSavedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState({});


  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/user/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSavedProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, [token]);

  if (!token) {
    navigate("/account");
    return null;
  }

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`/api/user/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setSavedProducts(savedProducts.filter((p) => p._id !== productId));
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to delete product.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  const handleReplace = async (originalId, newProduct) => {
    try {
      await fetch(`/api/user/products/${originalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const res = await fetch("/api/user/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProduct.name }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setSavedProducts((prev) =>
          prev
            .filter((p) => p._id !== originalId)
            .concat(data.product)
        );
        setSuggestions((prev) => {
          const copy = { ...prev };
          delete copy[originalId];
          return copy;
        });
      }
    } catch (err) {
      console.error("Replace failed:", err);
      setMessage("Failed to replace product.");
    }
  };
  
  const findAlternatives = async (name, currentRisk, originalId) => {
    if (suggestions[originalId]) {
      setSuggestions((prev) => {
        const copy = { ...prev };
        delete copy[originalId];
        return copy;
      });
      return;
    }
  
    try {
      const res = await fetch(
        `/api/products/alternatives?name=${encodeURIComponent(name)}&currentRisk=${currentRisk}`
      );
      const data = await res.json();
  
      if (res.ok && data.results.length > 0) {
        setSuggestions((prev) => ({
          ...prev,
          [originalId]: data.results,
        }));
      } else {
        setSuggestions((prev) => ({
          ...prev,
          [originalId]: [],
        }));
        setMessage("No lower-risk alternatives found.");
      }
    } catch (err) {
      console.error("Error finding alternatives:", err);
      setMessage("Error finding alternatives.");
    }
  };
  
  
  

  const getRiskCount = (riskLevel) => {
    return savedProducts.filter((p) => {
      if (riskLevel === "low") return !p.high?.length && !p.med?.length;
      return p.risk === riskLevel;
    }).length;
  };
  
  const ingredientMap = {};
  
  savedProducts.forEach((p) => {
    (p.high || []).forEach((ing) => {
      ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
    });
    (p.med || []).forEach((ing) => {
      ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
    });
  });
  
  const topIngredients = Object.entries(ingredientMap)
    .sort((a, b) => b[1] - a[1])
    .map(([ingredient]) => ingredient);
  
  

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return;

    try {
      const res = await fetch("/api/user/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: productName }),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedProducts([...savedProducts, data.product]);
        setProductName("");
        setMessage("Product saved!");
      } else {
        setMessage(data.message || "Error saving product.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>{user?.username}'s Dashboard</h2>
  
      <form onSubmit={handleAddProduct} className="add-form">
        <input
          type="text"
          placeholder="Enter skincare product"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
  
      {message && <p>{message}</p>}
  
      {savedProducts.length > 0 && (
        <div className="summary-card">
          <h3>Summary</h3>
          <p>
            You’ve saved {savedProducts.length} product{savedProducts.length !== 1 ? "s" : ""}.
          </p>
          <p>
            {getRiskCount("high")} high-risk, {getRiskCount("medium")} medium-risk, {getRiskCount("low")} low-risk products.
          </p>
          {topIngredients.length > 0 && (
            <p>
              Most flagged ingredients: <strong>{topIngredients.slice(0, 3).join(", ")}</strong>
            </p>
          )}
        </div>
      )}
  
      <h3>My Skincare Products:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {savedProducts.map((prod) => (
          <li
          key={prod._id}
          className={`product-card ${
            prod.risk === "high"
              ? "high-risk"
              : prod.risk === "medium"
              ? "medium-risk"
              : "low-risk"
          }`}
        >        
            <strong>{prod.name}</strong> – Risk: {prod.risk || "unknown"}
            <ul>
            {prod.high?.length > 0 && (
                <li>
                    <strong>High-Risk Ingredients:</strong>{" "}
                    {prod.high.map((ing, idx) => (
                    <span key={idx}>
                        <IngredientTooltip name={ing} />
                        {idx < prod.high.length - 1 && ", "}
                    </span>
                    ))}
                </li>
                )}

            {prod.med?.length > 0 && (
            <li>
                <strong>Medium-Risk Ingredients:</strong>{" "}
                {prod.med.map((ing, idx) => (
                <span key={idx}>
                    <IngredientTooltip name={ing} />
                    {idx < prod.med.length - 1 && ", "}
                </span>
                ))}
            </li>
            )}

              {(!prod.high?.length && !prod.med?.length) && (
                <li>No flagged ingredients</li>
              )}
            </ul>
            {(prod.high?.length > 0 || prod.med?.length > 0) && (
            <button
                className="alter"
                onClick={() => findAlternatives(prod.name, prod.risk, prod._id)}
            >
                {suggestions[prod._id] ? "Hide Alternatives" : "Find Lower-Risk Alternative"}
            </button>
            )}


            {suggestions[prod._id] && (
            <div className="suggestions-box">
                <p><strong>Suggested Alternatives:</strong></p>
                <ul style={{ paddingLeft: "1rem" }}>
                {suggestions[prod._id].map((alt, idx) => (
                    <li key={idx}>
                    <span>{alt.name} (Risk: {alt.risk}) </span>
                    <button onClick={() => handleReplace(prod._id, alt)}>Replace</button>
                    </li>
                ))}
                </ul>
            </div>
            )}


            <button
              className="delete-button"
              onClick={() => handleDelete(prod._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default Dashboard;
