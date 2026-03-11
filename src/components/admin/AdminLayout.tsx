import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import {
    LayoutDashboard,
    Users,
    Package,
    Truck,
    Repeat,
    LogOut,
    Menu,
    X,
    FlaskConical,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import astraLogo from '@/assets/astra-logo.png';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { admin, logout } = useAdminAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Package, label: 'Inventory', path: '/admin/inventory' },
        { icon: Truck, label: 'Orders & Deliveries', path: '/admin/orders' },
        { icon: Users, label: 'Customers', path: '/admin/customers' },
        { icon: Repeat, label: 'Subscriptions', path: '/admin/subscriptions' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
        { icon: FlaskConical, label: 'Sample Requests', path: '/admin/samples' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 border-b border-border flex items-center justify-between lg:justify-center">
                    <div className="flex items-center gap-3">
                        <img src={astraLogo} alt="Astra Dairy" className="h-10 w-10 object-contain" />
                        <div>
                            <span className="text-xl font-bold text-primary block leading-tight">Astra<span className="text-accent">Dairy</span></span>
                            <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Admin Portal</span>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="mb-6 px-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                            }`
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-secondary/30 border border-border">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {admin?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">{admin?.name}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{admin?.role}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-border bg-card flex items-center px-4 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 text-center font-bold text-primary mr-4">
                        Astra<span className="text-accent">Admin</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-secondary/10 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
