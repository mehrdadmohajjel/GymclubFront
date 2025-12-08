import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutMain from "./components/LayoutMain";

// ==== Lazy Loaded Pages ====
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));

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

const PaymentResult = lazy(() => import("./pages/Payment/Result"));
//const PaymentMock = lazy(() => import("./pages/Payment/MockPay"));

// Component that decides which dashboard to load
const DashboardSwitch: React.FC = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" replace />;

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

const App: React.FC = () => {
    const { user } = useContext(AuthContext);

    return (
        <LayoutMain>
            <Suspense fallback={<div>در حال بارگذاری...</div>}>
                <Routes>
                    {/* Auto-redirect based on login */}
                    <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot" element={<ForgotPassword />} />

                    {/* Payment */}
                    <Route path="/payments/result" element={<PaymentResult />} />

                    {/* Protected Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardSwitch />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all 404 */}
                    <Route path="*" element={<div>صفحه پیدا نشد</div>} />
                </Routes>
            </Suspense>
        </LayoutMain>
    );
};

export default App;
