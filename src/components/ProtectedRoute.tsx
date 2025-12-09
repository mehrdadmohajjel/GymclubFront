import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({
    children,
    roles
}: {
    children: any;
    roles?: string[];
}) => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role))
        return <Navigate to="/unauthorized" replace />;

    return children;
};

export default ProtectedRoute;
