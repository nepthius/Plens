import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
            <div>
                <Link to="/">Home</Link>
            </div>
            <div>
                {user ? (
                    <>
                        <span style={{ marginRight: "1rem" }}>👤 {user.username}</span>
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
