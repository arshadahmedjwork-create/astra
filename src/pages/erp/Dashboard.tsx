import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Truck, Pause, CheckCircle2, Package, CreditCard, Bell, Navigation, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import 'react-day-picker/dist/style.css';

type DeliveryStatus = 'all' | 'paused' | 'get_to_deliver' | 'delivered';

interface OrderSummary {
    pending: number;
    delivered: number;
    paused: number;
}

const statusFilters = [
    { key: 'paused' as DeliveryStatus, label: 'Paused', icon: Pause, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { key: 'get_to_deliver' as DeliveryStatus, label: 'Get to Deliver', icon: Truck, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { key: 'delivered' as DeliveryStatus, label: 'Delivered', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

const Dashboard = () => {
    const { customer } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState<DeliveryStatus>('all');
    const [orderSummary, setOrderSummary] = useState<OrderSummary>({ pending: 0, delivered: 0, paused: 0 });
    const [deliveryDates, setDeliveryDates] = useState<Date[]>([]);
    const [pausedDates, setPausedDates] = useState<Date[]>([]);
    const [deliveredDates, setDeliveredDates] = useState<Date[]>([]);
    const [activeOrders, setActiveOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!customer?.id) return;

        const fetchOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id);

            if (data) {
                const pending = data.filter(o => o.status === 'pending' || o.status === 'get_to_deliver').length;
                const delivered = data.filter(o => o.status === 'delivered').length;
                const paused = data.filter(o => o.status === 'paused').length;
                setOrderSummary({ pending, delivered, paused });

                setDeliveryDates(data.filter(o => o.status === 'pending' || o.status === 'get_to_deliver').map(o => new Date(o.delivery_date)));
                setPausedDates(data.filter(o => o.status === 'paused').map(o => new Date(o.delivery_date)));
                setDeliveredDates(data.filter(o => o.status === 'delivered').map(o => new Date(o.delivery_date)));
                setActiveOrders(data.filter(o => o.status === 'get_to_deliver'));
            }
        };
        fetchOrders();
    }, [customer?.id]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                {greeting()}, {customer?.full_name?.split(' ')[0] || 'Customer'} 👋
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Here's your delivery overview for today
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                                {customer?.customer_id}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Active Deliveries Section */}
                {activeOrders.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        {activeOrders.map(order => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
                                        <Truck className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Order Out for Delivery!</h3>
                                        <p className="text-sm text-muted-foreground">Your delivery partner is on the way with your order.</p>
                                    </div>
                                </div>
                                <Link to={`/erp/track/${order.id}`}>
                                    <button className="forest-gradient text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                        <Navigation className="w-4 h-4" /> Track Live Location
                                    </button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-2xl border border-border p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{orderSummary.pending}</p>
                                <p className="text-xs text-muted-foreground">Pending Deliveries</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-card rounded-2xl border border-border p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{orderSummary.delivered}</p>
                                <p className="text-xs text-muted-foreground">Delivered</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-2xl border border-border p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Pause className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{orderSummary.paused}</p>
                                <p className="text-xs text-muted-foreground">Paused</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Wallet Balance Card (Quick View) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.22 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-primary/10 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available Balance</p>
                                <h3 className="text-2xl font-black text-foreground">₹{customer?.wallet_balance?.toLocaleString() || '0.00'}</h3>
                            </div>
                        </div>
                        <Link to="/erp/wallet">
                            <button className="bg-white text-primary border border-primary/20 hover:bg-primary/5 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
                                <CreditCard className="w-4 h-4" /> Manage Wallet
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Status Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-wrap gap-2"
                >
                    {statusFilters.map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(activeFilter === filter.key ? 'all' : filter.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
                  ${activeFilter === filter.key
                                        ? filter.color + ' shadow-sm'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {filter.label}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Map + Calendar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Delivery Location
                            </h3>
                        </div>
                        <div className="aspect-[4/3] bg-sage/20 relative">
                            {customer?.address?.lat && customer?.address?.lng ? (
                                <iframe
                                    title="Delivery Location"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${customer.address.lng - 0.01},${customer.address.lat - 0.01},${customer.address.lng + 0.01},${customer.address.lat + 0.01}&layer=mapnik&marker=${customer.address.lat},${customer.address.lng}`}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="text-center">
                                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No location data available</p>
                                        <p className="text-xs mt-1">Update your address in Profile</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Calendar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-card rounded-2xl border border-border"
                    >
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Delivery Calendar
                            </h3>
                        </div>
                        <div className="p-4 flex justify-center">
                            <DayPicker
                                mode="multiple"
                                selected={
                                    activeFilter === 'paused'
                                        ? pausedDates
                                        : activeFilter === 'delivered'
                                            ? deliveredDates
                                            : activeFilter === 'get_to_deliver'
                                                ? deliveryDates
                                                : [...deliveryDates, ...pausedDates, ...deliveredDates]
                                }
                                modifiers={{
                                    delivered: deliveredDates,
                                    paused: pausedDates,
                                    scheduled: deliveryDates,
                                }}
                                modifiersStyles={{
                                    delivered: { backgroundColor: 'hsl(152 60% 90%)', color: 'hsl(152 60% 30%)', borderRadius: '8px' },
                                    paused: { backgroundColor: 'hsl(38 90% 90%)', color: 'hsl(38 80% 30%)', borderRadius: '8px' },
                                    scheduled: { backgroundColor: 'hsl(210 90% 90%)', color: 'hsl(210 80% 30%)', borderRadius: '8px' },
                                }}
                                className="!font-sans"
                            />
                        </div>
                        <div className="px-4 pb-4 flex flex-wrap gap-3 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-blue-200" /> Scheduled
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-amber-200" /> Paused
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-emerald-200" /> Delivered
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default Dashboard;
