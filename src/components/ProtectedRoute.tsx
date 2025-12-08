import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

type ProtectedRouteProps = {
    children: React.ReactElement;
    roles?: string[]; // optional: allowed roles
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { user, isAuthenticated } = React.useContext(AuthContext);
    const location = useLocation();

    // Not logged in → go to login and remember where user came from
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    // Logged in but no permission
    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Access granted
    return children;
};

export default ProtectedRoute;
