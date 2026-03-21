import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Search, 
    Truck, 
    Package, 
    Navigation, 
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import ERPLayout from '@/components/erp/ERPLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LiveTrackingSearch = () => {
    const { customer } = useAuthStore();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer?.id) {
            fetchActiveOrders();
        }
    }, [customer?.id]);

    const fetchActiveOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id)
                .in('status', ['pending', 'preparing', 'get_to_deliver'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActiveOrders(data || []);
        } catch (err) {
            console.error('Error fetching active orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!searchId.trim()) return;

        // Simple validation or direct navigation
        navigate(`/erp/track/${searchId.trim()}`);
    };

    return (
        <ERPLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">Track Your Order</h1>
                    <p className="text-muted-foreground">Enter your order ID or select an active delivery below</p>
                </div>

                {/* Search Bar */}
                <Card className="border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input 
                                    placeholder="Enter Order ID (e.g. 8a2f...)" 
                                    className="pl-10 h-12 bg-background border-border"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="h-12 px-8 forest-gradient font-bold gap-2">
                                <Navigation className="w-4 h-4" /> Track Now
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Active Orders List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <Truck className="w-5 h-5" /> Your Active Deliveries
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : activeOrders.length === 0 ? (
                        <Card className="border-dashed border-border py-12">
                            <CardContent className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                <Package className="w-12 h-12 text-muted-foreground" />
                                <p className="text-sm font-medium">No live deliveries at the moment</p>
                                <Link to="/erp/products">
                                    <Button variant="link" className="text-primary font-bold">Start Shopping</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {activeOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card 
                                        className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm"
                                        onClick={() => navigate(`/erp/track/${order.id}`)}
                                    >
                                        <CardContent className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                                    {order.status === 'get_to_deliver' ? <Truck size={24} /> : <Package size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-muted-foreground uppercase">{order.id.slice(0, 8)}</span>
                                                        <Badge variant={order.status === 'get_to_deliver' ? 'default' : 'secondary'} className="text-[10px] py-0">
                                                            {order.status.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-bold text-foreground mt-0.5">₹{order.total_amount}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>Scheduled for {new Date(order.delivery_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Help Section */}
                <div className="bg-secondary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                        <AlertCircle className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Need help finding your Order ID?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your order ID can be found in your Order History or the confirmation email sent to you. 
                            Live location becomes active once our delivery partner picks up your order.
                        </p>
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default LiveTrackingSearch;
