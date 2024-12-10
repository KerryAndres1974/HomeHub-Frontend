import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from './AuthProvider.jsx';

function RutaProtegida({ allowedRoles }) {
    const auth = useAuth();
    const { accessToken, cargo } = auth.login();

    if (!accessToken) {
        return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(cargo)) {
        return <Navigate to="/Desautorizado" />;
    }

    return <Outlet />;
}

export default RutaProtegida;