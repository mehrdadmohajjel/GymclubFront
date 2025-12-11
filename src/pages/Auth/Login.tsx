import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // استایل حرفه‌ای

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);

    const { login, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await login(email, password, remember);

        if (!result.success) {
            alert(result.message);
            return;
        }

        const role = result.user!.role;

        if (role === "SuperAdmin") navigate("/superadmin/dashboard");
        else if (role === "GymAdmin") navigate("/gymadmin/dashboard");
        else if (role === "Trainer") navigate("/trainer/dashboard");
        else navigate("/athlete/dashboard");
    };

    return (
        <div className="login-container">

            <form className="login-box" onSubmit={handleLogin}>
                <h2 className="title">ورود به سیستم باشگاه</h2>

                <input
                    type="email"
                    className="input"
                    placeholder="ایمیل"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    className="input"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <label className="remember-box">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                    />
                    مرا به خاطر بسپار
                </label>

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "درحال ورود..." : "ورود"}
                </button>

                <div className="links">
                    <a href="/register">ثبت‌نام</a>
                    <a href="/forgot">فراموشی رمز</a>
                </div>
            </form>

        </div>
    );
};

export default Login;
