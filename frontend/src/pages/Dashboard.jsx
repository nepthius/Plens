import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [savedProducts, setSavedProducts] = useState([]);
  const [message, setMessage] = useState("");

  if (!token) {
    navigate("/account");
    return null;
  }

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

      <h3>My Skincare Products:</h3>
      <ul>
        {savedProducts.map((prod, idx) => (
          <li key={idx}>{prod.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
