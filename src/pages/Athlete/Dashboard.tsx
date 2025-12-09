import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

/*
  Athlete Dashboard (self-contained)
  - Injects its own CSS on mount so you don't need an extra file
  - Reads `user` from AuthContext if available
  - Fetches (or mocks) data for: membership, upcoming workouts, buffet purchases, progress
  - Responsive layout and theme-aware via CSS variables (assumes your global CSS defines --bg, --card, --text, --primary)

  Path: /src/pages/Athlete/Dashboard.tsx
*/

type Workout = {
  id: string;
  title: string;
  date: string; // ISO
  coach?: string;
  status: "scheduled" | "completed" | "missed";
};

type Purchase = {
  id: string;
  item: string;
  price: number;
  date: string;
};

const injectCss = () => {
  const css = `
  /* Athlete Dashboard local styles */
  .athlete-dashboard { padding: 18px; font-family: inherit; color: var(--text); }
  .dash-grid { display: grid; grid-template-columns: 320px 1fr; gap: 18px; }
  @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }

  .card { background: var(--card); padding: 16px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
  .profile { display:flex; gap:12px; align-items:center }
  .avatar { width:72px; height:72px; border-radius:12px; background:linear-gradient(135deg,var(--primary), #ffd19a); display:flex;align-items:center;justify-content:center;font-weight:700 }
  .kpis { display:flex; gap:12px; margin-top:12px }
  .kpi { flex:1; background: rgba(255,255,255,0.03); padding:10px; border-radius:8px; text-align:center }

  .section-title { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px }
  .btn { padding:8px 12px; border-radius:10px; text-decoration:none; background:var(--primary); color:#000; font-weight:600 }

  .workouts-list { display:flex; flex-direction:column; gap:10px }
  .workout { display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background: rgba(0,0,0,0.03) }

  .purchases-table { width:100%; border-collapse:collapse }
  .purchases-table th, .purchases-table td { padding:10px 8px; text-align:left }
  .purchases-scroll { max-height:240px; overflow:auto }

  /* simple progress chart placeholder styles */
  .progress-chart { height:200px; display:flex; align-items:center; justify-content:center; }

  `;
  const id = "athlete-dashboard-styles";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.innerHTML = css;
    document.head.appendChild(s);
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString();
};

const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  // Very small inline SVG sparkline without external deps
  const w = 260;
  const h = 80;
  if (!values || values.length === 0) return <div style={{height:h}} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const AthleteDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [membership, setMembership] = useState<{ status: string; expires?: string; tier?: string } | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    injectCss();

    // Try fetching real APIs; otherwise, fallback to mock data
    const fetchAll = async () => {
      try {
        // Example: adapt the endpoints to your backend
        const [mRes, wRes, pRes, prRes] = await Promise.all([
          fetch("/api/athlete/membership"),
          fetch("/api/athlete/workouts?limit=5"),
          fetch("/api/athlete/purchases?limit=10"),
          fetch("/api/athlete/progress?range=30"),
        ]);

        if (mRes.ok) setMembership(await mRes.json());
        if (wRes.ok) setWorkouts(await wRes.json());
        if (pRes.ok) setPurchases(await pRes.json());
        if (prRes.ok) setProgress(await prRes.json());

      } catch (err) {
        // Network or no backend available — use mocks
        setMembership({ status: "Active", expires: new Date(Date.now() + 1000*60*60*24*10).toISOString(), tier: "Gold" });

        setWorkouts([
          { id: "w1", title: "تمرین قدرتی - بالا تنه", date: new Date(Date.now()+1000*60*60*24).toISOString(), coach: "علی حسینی", status: "scheduled" },
          { id: "w2", title: "کاردیو اشتراکی", date: new Date(Date.now()-1000*60*60*24*2).toISOString(), coach: "مینا رضایی", status: "completed" },
          { id: "w3", title: "یوگا سبک", date: new Date(Date.now()+1000*60*60*24*3).toISOString(), coach: "نیما فرجی", status: "scheduled" },
        ]);

        setPurchases([
          { id: "p1", item: "آب معدنی", price: 15000, date: new Date(Date.now()-1000*60*60*24).toISOString() },
          { id: "p2", item: "پروتئین بار", price: 45000, date: new Date(Date.now()-1000*60*60*24*3).toISOString() },
        ]);

        setProgress([68,70,71,73,74,76,77,78,79]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="athlete-dashboard">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <h1>داشبورد من</h1>
        <div>
          <Link to="/athlete/membership" className="btn" style={{marginLeft:8}}>اشتراک</Link>
          <Link to="/athlete/program" className="btn">برنامه تمرینی</Link>
        </div>
      </div>

      <div className="dash-grid">
        {/* Left column */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="card">
            <div className="profile">
              {/* <div className="avatar">{user?.firstName?.[0] || (user?.email?.[0] ?? 'U')}</div> */}
              <div>
                {/* <div style={{fontWeight:700}}>{user?.firstName ?? "کاربر"} {user?.lastName ?? ""}</div> */}
                <div style={{opacity:0.8}}>{user?.nationalCode}</div>
                <div className="kpis">
                  <div className="kpi">
                    <div style={{fontSize:18,fontWeight:700}}>12</div>
                    <div style={{fontSize:12}}>تمرین‌ها</div>
                  </div>
                  <div className="kpi">
                    <div style={{fontSize:18,fontWeight:700}}>3</div>
                    <div style={{fontSize:12}}>خریدها</div>
                  </div>
                  <div className="kpi">
                    <div style={{fontSize:18,fontWeight:700}}>Gold</div>
                    <div style={{fontSize:12}}>سطح</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              <h3>وضعیت اشتراک</h3>
              <Link to="/athlete/membership" className="btn">مدیریت</Link>
            </div>
            {loading ? <div>در حال بارگذاری...</div> : (
              <div>
                <div>وضعیت: <strong>{membership?.status ?? "—"}</strong></div>
                {membership?.expires && <div>انقضاء: {formatDate(membership.expires)}</div>}
                <div>نوع: {membership?.tier ?? "—"}</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>پیشرفت شما (30 روز)</h3>
              <Link to="/athlete/progress" className="btn">جزئیات</Link>
            </div>
            <div className="progress-chart card" style={{padding:12}}>
              <Sparkline values={progress} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          <div className="card">
            <div className="section-title">
              <h3>تمرین‌های آینده</h3>
              <Link to="/athlete/program" className="btn">مشاهده همه</Link>
            </div>

            {loading ? <div>در حال بارگذاری...</div> : (
              <div className="workouts-list">
                {workouts.length === 0 && <div>تمرینی یافت نشد.</div>}
                {workouts.map(w => (
                  <div className="workout" key={w.id}>
                    <div>
                      <div style={{fontWeight:700}}>{w.title}</div>
                      <div style={{opacity:0.7, fontSize:13}}>{w.coach} • {formatDate(w.date)}</div>
                    </div>
                    <div style={{minWidth:120,textAlign:'right'}}>
                      <small style={{display:'block',opacity:0.8}}>{w.status}</small>
                      <Link to={`/athlete/workouts/${w.id}`} className="btn" style={{marginTop:8}}>جزئیات</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>خریدهای اخیر بوفه</h3>
              <Link to="/athlete/buffet" className="btn">خرید بیشتر</Link>
            </div>

            <div className="purchases-scroll">
              <table className="purchases-table">
                <thead>
                  <tr><th>آیتم</th><th>قیمت</th><th>تاریخ</th></tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id}>
                      <td>{p.item}</td>
                      <td>{p.price.toLocaleString()} تومان</td>
                      <td style={{opacity:0.8}}>{formatDate(p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AthleteDashboard;
