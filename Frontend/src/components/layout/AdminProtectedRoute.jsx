import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    let isAdmin = false;

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role === 'admin') {
                isAdmin = true;
            }
        } catch (err) {}
    }

    if (!token || !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
