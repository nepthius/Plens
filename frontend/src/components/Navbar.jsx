import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
        <nav className="navbar">
        <div>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="navbar-user">
            {user ? (
            <>
                <span>👤 {user.username}</span>
                <button onClick={logout}>Logout</button>
            </>
            ) : (
            <Link to="/account">Login</Link>
            )}
        </div>
        </nav>

  );
};

export default Navbar;
