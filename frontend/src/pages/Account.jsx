import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Account = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true); // toggle between login/signup
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                const res = await axios.post("/api/login", {
                    emailOrUsername,
                    password,
                });
                login(res.data.token);
            } else {
                const res = await axios.post("/api/register", {
                    username,
                    email,
                    password,
                });
                login(res.data.token);
            }
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>

            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        /><br />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /><br />
                    </>
                )}

                {isLogin ? (
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                    />
                ) : null}
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br />

                <button type="submit" style={{ marginTop: "1rem" }}>
                    {isLogin ? "Login" : "Sign Up"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <p style={{ marginTop: "1rem" }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    className="link-button"
                    onClick={() => setIsLogin(!isLogin)}
                    >
                    {isLogin ? "Sign Up" : "Login"}
                </button>

            </p>
        </div>
    );
};

export default Account;
