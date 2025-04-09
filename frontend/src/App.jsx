import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/account" replace />}
      />
      </Routes>
    </>
  );
}

export default App;
