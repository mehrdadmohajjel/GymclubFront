import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">

      {/* --- Header --- */}
      <header className="home-header">
        <div className="logo">GymClub</div>
        <nav>
          <Link to="/auth/login">ورود</Link>
          <Link to="/auth/register" className="btn-primary">ثبت نام</Link>
        </nav>
      </header>

      {/* --- Hero Section --- */}
      <section className="hero">
        <h1>باشگاه خود را هوشمند مدیریت کنید</h1>
        <p>سیستم مدیریت باشگاه، مربیان، ورزشکاران، برنامه‌ها، فروش بوفه و مالی</p>
        <Link to="/auth/register" className="btn-hero">شروع کنید</Link>
      </section>

      {/* --- Features --- */}
      <section className="features">
        <h2>امکانات سیستم</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>مدیریت ورزشکاران</h3>
            <p>ثبت، ویرایش و پیگیری پیشرفت ورزشکاران</p>
          </div>
          <div className="feature-card">
            <h3>سیستم مالی</h3>
            <p>پیگیری تراکنش‌ها، خریدها و اشتراک‌ها</p>
          </div>
          <div className="feature-card">
            <h3>مدیریت مربیان</h3>
            <p>ثبت مربیان، تعیین برنامه، مدیریت درخواست‌ها</p>
          </div>
          <div className="feature-card">
            <h3>فروش بوفه</h3>
            <p>فروش حضوری و آنلاین، گزارش‌گیری کامل</p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} GymClub — تمامی حقوق محفوظ است.</p>
      </footer>

    </div>
  );
};

export default Home;
