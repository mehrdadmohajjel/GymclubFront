import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";

const Sidebar: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h2>GymClub</h2>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === "light" ? "🌙" : "☀️"}
                </button>
            </div>

            <nav>
                {user?.role === "SuperAdmin" && (
                    <>
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/superadmin/gyms">مدیریت باشگاه‌ها</Link>
                    </>
                )}

                {user?.role === "GymAdmin" && (
                    <>
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/gymadmin/members">مدیریت ورزشکاران</Link>
                        <Link to="/gymadmin/trainers">مدیریت مربیان</Link>
                        <Link to="/gymadmin/buffet">مدیریت بوفه</Link>
                        <Link to="/gymadmin/finance">امور مالی</Link>
                    </>
                )}

                {user?.role === "Athlete" && (
                    <>
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/athlete/membership">اشتراک من</Link>
                        <Link to="/athlete/program">برنامه تمرینی</Link>
                        <Link to="/athlete/buffet">خریدها</Link>
                    </>
                )}

                {user?.role === "Trainer" && (
                    <>
                        <Link to="/dashboard">داشبورد</Link>
                        <Link to="/trainer/create">ساخت برنامه</Link>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
