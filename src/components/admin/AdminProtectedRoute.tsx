import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

const AdminProtectedRoute = () => {
    const { isAuthenticated } = useAdminAuthStore();

    if (!isAuthenticated) {
        // Redirect to admin login if not authenticated
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
