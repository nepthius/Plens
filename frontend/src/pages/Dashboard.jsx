import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [savedProducts, setSavedProducts] = useState([]);
  const [message, setMessage] = useState("");

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

  const findAlternatives = async (name, currentRisk) => {
    const res = await fetch(
      `/api/products/alternatives?name=${encodeURIComponent(name)}&currentRisk=${currentRisk}`
    );
  
    const data = await res.json();
    if (res.ok) {
      alert(
        data.results.length > 0
          ? `Suggested safer alternatives:\n\n${data.results.map(p => `• ${p.name} (Risk: ${p.risk})`).join("\n")}`
          : "No lower-risk alternatives found."
      );
    } else {
      alert(data.message || "Error finding alternatives.");
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
    <div style={{ padding: "2rem" }}>
      <h2>{user?.username}'s Dashboard</h2>
      <form onSubmit={handleAddProduct}>
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

     
        {/* 🧠 Summary Section */}
        
        {savedProducts.length > 0 && (
        <div className = "summary-card" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
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
      <ul>
        {savedProducts.map((prod) => (
            <li key={prod._id}>
            <strong>{prod.name}</strong> – Risk: {prod.risk || "unknown"}
            <ul>
                {prod.high?.length > 0 && (
                <li><strong>High-Risk Ingredients:</strong> {prod.high.join(", ")}</li>
                )}
                {prod.med?.length > 0 && (
                <li><strong>Medium-Risk Ingredients:</strong> {prod.med.join(", ")}</li>
                )}
                {(!prod.high?.length && !prod.med?.length) && (
                <li>No flagged ingredients</li>
                )}
            </ul>
            <button
                style={{ marginTop: "0.25rem" }}
                onClick={() => findAlternatives(prod.name, prod.risk)}
                >
                🔄 Find Lower-Risk Alternative
            </button>


            <button onClick={() => handleDelete(prod._id)} style={{ marginTop: "0.5rem" }}>
                🗑 Delete
            </button>
            </li>
        ))}
        </ul>


    </div>
  );
};

export default Dashboard;
