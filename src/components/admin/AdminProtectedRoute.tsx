import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

/**
 * AdminProtectedRoute
 *
 * Security: Does NOT trust the persisted localStorage boolean.
 * On every mount it calls checkAuth() which issues a fresh Supabase DB
 * query to confirm the stored admin.id still exists and is valid.
 * localStorage manipulation therefore cannot unlock admin access.
 */
const AdminProtectedRoute = () => {
    const { admin, checkAuth } = useAdminAuthStore();
    const [verified, setVerified] = useState<boolean | null>(null); // null = loading

    useEffect(() => {
        let cancelled = false;
        const verify = async () => {
            const valid = await checkAuth();
            if (!cancelled) setVerified(valid);
        };
        verify();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // While checking — show a branded spinner, not a redirect
    if (verified === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p
                        className="text-sm text-muted-foreground"
                        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                    >
                        Verifying access…
                    </p>
                </div>
            </div>
        );
    }

    if (!verified || !admin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
