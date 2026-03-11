import { useState, useEffect } from 'react';
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

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Placeholder data for charts
    const revenueData = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    const deliveryData = [
        { name: 'Cow Milk', value: 400 },
        { name: 'Buffalo Milk', value: 300 },
        { name: 'A2 Milk', value: 200 },
        { name: 'Paneer', value: 100 },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch total customers
            const { count: customerCount } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true });

            // Fetch active subscriptions
            const { count: subCount } = await supabase
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Fetch pending samples
            const { count: sampleCount } = await supabase
                .from('sample_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'requested');

            // Fetch today's deliveries (orders with status pending or get_to_deliver for today)
            const today = new Date().toISOString().split('T')[0];
            const { count: deliveryCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('delivery_date', today)
                .in('status', ['pending', 'get_to_deliver']);

            // Fetch recent orders for the table
            const { data: orders } = await supabase
                .from('orders')
                .select(`
                    id, 
                    order_date, 
                    status, 
                    total_amount,
                    customers (full_name, customer_id)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalCustomers: customerCount || 0,
                activeSubscriptions: subCount || 0,
                todayDeliveries: deliveryCount || 0,
                pendingSamples: sampleCount || 0,
                monthlyRevenue: 125000, // Placeholder until payments table is fully populated
            });

            if (orders) setRecentOrders(orders);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
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
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Trends</CardTitle>
                        <CardDescription>Daily revenue for the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Product Demands</CardTitle>
                        <CardDescription>Top delivering products today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deliveryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} width={90} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--secondary))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={24} />
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
