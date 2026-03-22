import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    FlaskConical,
    RefreshCw,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ShoppingCart,
    Navigation,
    BellRing,
    CheckCircle2,
    Package
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/useCartStore';
import astraLogo from '@/assets/astra-logo.png';
import { Button } from '../ui/button';

const DailyPrompt = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    useState(() => {
        const today = new Date().toDateString();
        const lastConfirmed = localStorage.getItem('astra_daily_confirmed');
        if (lastConfirmed !== today) {
            setIsVisible(true);
        }
    });

    const handleConfirm = () => {
        const today = new Date().toDateString();
        localStorage.setItem('astra_daily_confirmed', today);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-card border border-primary/20 p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BellRing className="w-10 h-10 text-primary animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Daily Confirmation</h2>
                    <p className="text-muted-foreground mb-8 text-sm">
                        Please confirm your delivery for today to ensure everything is on track!
                    </p>
                    <Button 
                        onClick={handleConfirm}
                        className="w-full forest-gradient h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Confirm Today's Order
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const sidebarItems = [
    { name: 'Dashboard', href: '/erp/dashboard', icon: LayoutDashboard },
    { name: 'My Products', href: '/erp/products', icon: ShoppingBag },
    { name: 'My Subscriptions', href: '/erp/subscriptions', icon: RefreshCw },
    { name: 'Order History', href: '/erp/orders', icon: Package },
    { name: 'Track Order', href: '/erp/track', icon: Navigation },
    { name: 'Request Sample', href: '/erp/request-sample', icon: FlaskConical },
    { name: 'Renew Subscription', href: '/erp/subscription', icon: RefreshCw },
    { name: 'Payment History', href: '/erp/payments', icon: CreditCard },
    { name: 'My Profile', href: '/erp/profile', icon: User },
];

interface ERPLayoutProps {
    children: React.ReactNode;
}

const ERPLayout = ({ children }: ERPLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { customer, logout } = useAuthStore();
    const { items } = useCartStore();

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/erp/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={astraLogo} alt="Astra Dairy" className="h-9 w-9 object-contain" />
                        <span className="text-lg font-bold text-primary">
                            Astra<span className="text-accent">Dairy</span>
                        </span>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">Customer Portal</p>
                </div>

                {/* Customer Info */}
                {customer && (
                    <div className="px-6 py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {customer.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{customer.full_name}</p>
                                <p className="text-xs text-muted-foreground">{customer.customer_id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {item.name}
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header + Overlay */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={astraLogo} alt="Astra Dairy" className="h-8 w-8 object-contain" />
                        <span className="text-base font-bold text-primary">
                            Astra<span className="text-accent">Dairy</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/erp/cart" className="p-2 text-foreground relative mr-2">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-foreground border border-border rounded-lg">
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="lg:hidden fixed inset-0 bg-foreground/30 z-40"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', damping: 25 }}
                                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col"
                            >
                                <div className="p-6 border-b border-border flex items-center justify-between">
                                    <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                                        <img src={astraLogo} alt="Astra Dairy" className="h-9 w-9 object-contain" />
                                        <span className="text-lg font-bold text-primary">
                                            Astra<span className="text-accent">Dairy</span>
                                        </span>
                                    </Link>
                                    <button onClick={() => setSidebarOpen(false)} className="p-1 text-foreground/60">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {customer && (
                                    <div className="px-6 py-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {customer.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">{customer.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.customer_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                    {sidebarItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                          ${isActive
                                                        ? 'bg-primary text-primary-foreground shadow-md'
                                                        : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="p-3 border-t border-border">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <header className="hidden lg:flex items-center justify-end px-8 py-4 bg-card/50 backdrop-blur-sm border-b border-border">
                    <Link to="/erp/cart" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all group relative">
                        <ShoppingCart className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-foreground">My Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
            <DailyPrompt />
        </div>
    );
};

export default ERPLayout;
