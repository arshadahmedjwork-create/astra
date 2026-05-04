import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Users,
    Truck,
    IndianRupee,
    FlaskConical,
    TrendingUp,
    CalendarClock,
    PackageCheck
} from 'lucide-react';
// Local shape for the recent-orders query (joined with customers)
interface RecentOrder {
    id: string;
    order_date: string;
    status: string;
    total_amount: number;
    customers: {
        full_name: string;
        customer_id: string;
    } | null;
}
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeSubscriptions: 0,
        todayDeliveries: 0,
        pendingSamples: 0,
        monthlyRevenue: 0,
    });

    const [recentOrders,  setRecentOrders]  = useState<RecentOrder[]>([]);
    const [deliveryChart, setDeliveryChart] = useState<{ name: string; deliveries: number }[]>([]);
    const [productChart,  setProductChart]  = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // ── KPI Queries (parallel) ────────────────────────────────────────
            const [
                { count: customerCount },
                { count: subCount },
                { count: sampleCount },
                { count: deliveryCount },
                { data: orders },
                { data: revenueRows },
                { data: productRows },
            ] = await Promise.all([
                supabase.from('customers').select('*', { count: 'exact', head: true }),
                supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('sample_requests').select('*', { count: 'exact', head: true }).eq('status', 'requested'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('delivery_date', today).in('status', ['pending', 'get_to_deliver', 'preparing']),

                // Recent orders table
                supabase.from('orders')
                    .select('id, order_date, status, total_amount, customers(full_name, customer_id)')
                    .order('created_at', { ascending: false })
                    .limit(5),

                // 7-day daily delivery chart (count of orders per day)
                supabase.from('orders')
                    .select('delivery_date, status')
                    .gte('delivery_date', new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0])
                    .lte('delivery_date', today),

                // Product demand: active subscriptions grouped by product name
                supabase.from('subscriptions')
                    .select('quantity, products(name)')
                    .eq('status', 'active'),
            ]);

            // ── Build 7-day chart ─────────────────────────────────────────────
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayCounts: Record<string, number> = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000);
                const key = d.toISOString().split('T')[0];
                dayCounts[key] = 0;
            }
            (revenueRows || []).forEach((row) => {
                if (row.delivery_date && row.delivery_date in dayCounts) dayCounts[row.delivery_date]++;
            });
            const deliveryChartData = Object.entries(dayCounts).map(([date, count]) => ({
                name: dayLabels[new Date(date + 'T00:00:00').getDay()],
                deliveries: count,
            }));

            // ── Build product demand chart ────────────────────────────────────
            const productMap: Record<string, number> = {};
            (productRows || []).forEach((row) => {
                const rowAny = row as unknown as { products: { name: string }, quantity: number };
                const name = rowAny.products?.name || 'Unknown';
                productMap[name] = (productMap[name] || 0) + (rowAny.quantity || 1);
            });
            const productChartData = Object.entries(productMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, value]) => ({ name, value }));

            // ── Monthly revenue from delivered orders ─────────────────────────
            const monthStart = new Date();
            monthStart.setDate(1);
            const { data: revData } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('status', 'delivered')
                .gte('delivery_date', monthStart.toISOString().split('T')[0]);
            const monthlyRevenue = (revData || []).reduce((s: number, r) => s + (r.total_amount || 0), 0);

            setStats({
                totalCustomers:     customerCount || 0,
                activeSubscriptions: subCount || 0,
                todayDeliveries:    deliveryCount || 0,
                pendingSamples:     sampleCount || 0,
                monthlyRevenue,
            });
            if (orders)          setRecentOrders(orders as unknown as RecentOrder[]);
            if (deliveryChartData.length) setDeliveryChart(deliveryChartData);
            if (productChartData.length)  setProductChart(productChartData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        // Real-time — re-fetch when orders or subscriptions change
        const channel = supabase
            .channel('admin-dashboard-rt')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },        () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchDashboardData())
            .subscribe();

        // Also poll every 30 s as a fallback
        const timer = setInterval(fetchDashboardData, 30_000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(timer);
        };
    }, [fetchDashboardData]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-black text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">
                                    {loading ? '...' : stats.totalCustomers}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="font-medium">+12%</span>
                            <span className="text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Today's Deliveries</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">
                                    {loading ? '...' : stats.todayDeliveries}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Truck className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <CalendarClock className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">Scheduled for today</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Samples</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">
                                    {loading ? '...' : stats.pendingSamples}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FlaskConical className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <PackageCheck className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">Requires attention</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                                <h3 className="text-2xl font-bold text-foreground mt-1">
                                    ₹{loading ? '...' : stats.monthlyRevenue.toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="font-medium">+8.2%</span>
                            <span className="text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Daily Deliveries</CardTitle>
                            <CardDescription>Orders scheduled per day — last 7 days (live)</CardDescription>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </span>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={deliveryChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(v: number) => [`${v} deliveries`, 'Count']}
                                    />
                                    <Area type="monotone" dataKey="deliveries" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorDelivery)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Product Demand</CardTitle>
                        <CardDescription>Active subscriptions by product (live)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productChart} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" hide allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} width={90} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--secondary))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        formatter={(v: number) => [`${v} units`, 'Subscribed qty']}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders List */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <CardDescription>The latest transactions across the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Customer</th>
                                    <th className="px-4 py-3 font-medium">Order Date</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading orders...</td>
                                    </tr>
                                ) : recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No recent orders found.</td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-foreground">{order.customers?.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{order.customers?.customer_id}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(order.order_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                ₹{order.total_amount || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                    }`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
