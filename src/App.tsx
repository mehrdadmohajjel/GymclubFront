import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutMain from "./components/LayoutMain";

// ==== Lazy Loaded Pages ====
const Home = lazy(() => import("./pages/Home/Home"));

// Auth
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

// Dashboards
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdmin/Dashboard"));
const GymsManagement = lazy(() => import("./pages/SuperAdmin/GymsManagement"));

const Members = lazy(() => import("./pages/GymAdmin/Members"));
const Movements = lazy(() => import("./pages/GymAdmin/Movements"));
const Buffet = lazy(() => import("./pages/GymAdmin/Buffet"));
const GymAdminDashboard = lazy(() => import("./pages/GymAdmin/Dashboard"));

const TrainerDashboard = lazy(() => import("./pages/Trainer/Dashboard"));
const CreateWorkout = lazy(() => import("./pages/Trainer/CreateWorkout"));

const AthleteDashboard = lazy(() => import("./pages/Athlete/Dashboard"));
const MembershipPage = lazy(() => import("./pages/Athlete/Membership"));

// Payment
const PaymentResult = lazy(() => import("./pages/Payment/Result"));


// ========= Dashboard Switch (Redirect by Role) =========
const DashboardSwitch: React.FC = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/auth/login" replace />;

    switch (user.role) {
        case "SuperAdmin":
            return <SuperAdminDashboard />;
        case "GymAdmin":
            return <GymAdminDashboard />;
        case "Trainer":
            return <TrainerDashboard />;
        default:
            return <AthleteDashboard />;
    }
};


// ========================== APP ==========================
const App: React.FC = () => {
    const { user } = useContext(AuthContext);

    return (
        <LayoutMain>
            <Suspense fallback={<div>در حال بارگذاری...</div>}>

                <Routes>

                    {/* ------------------------ */}
                    {/*         PUBLIC           */}
                    {/* ------------------------ */}

                    <Route
                        path="/"
                        element={
                            user ? <Navigate to="/dashboard" replace /> : <Home />
                        }
                    />

                    {/* AUTH PATHS (با prefix /auth) */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/forgot" element={<ForgotPassword />} />

                    {/* Payment عمومی */}
                    <Route path="/payments/result" element={<PaymentResult />} />


                    {/* ------------------------ */}
                    {/*         PROTECTED        */}
                    {/* ------------------------ */}

                    {/* Dashboard بر اساس نقش */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardSwitch />
                            </ProtectedRoute>
                        }
                    />

                    {/* Gym Admin Routes */}
                    <Route
                        path="/gymadmin/members"
                        element={
                            <ProtectedRoute roles={["GymAdmin"]}>
                                <Members />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/gymadmin/movements"
                        element={
                            <ProtectedRoute roles={["GymAdmin"]}>
                                <Movements />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/gymadmin/buffet"
                        element={
                            <ProtectedRoute roles={["GymAdmin"]}>
                                <Buffet />
                            </ProtectedRoute>
                        }
                    />

                    {/* Athlete */}
                    <Route
                        path="/athlete/dashboard"
                        element={
                            <ProtectedRoute roles={["Athlete"]}>
                                <AthleteDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* 404 */}
                    <Route path="*" element={<div>صفحه پیدا نشد</div>} />

                </Routes>

            </Suspense>
        </LayoutMain>
    );
};

export default App;
