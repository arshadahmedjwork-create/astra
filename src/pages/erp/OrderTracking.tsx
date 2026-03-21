import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    ChefHat, 
    ChevronLeft, 
    Phone, 
    MapPin,
    Navigation
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ERPLayout from '@/components/erp/ERPLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [driver, setDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
            const subscription = subscribeToDriverUpdates();
            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    drivers (*),
                    order_items (*, products(name))
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            setOrder(data);
            if (data.drivers) setDriver(data.drivers);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToDriverUpdates = () => {
        return supabase
            .channel('driver-location')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'drivers',
                    filter: order?.driver_id ? `id=eq.${order.driver_id}` : undefined
                },
                (payload) => {
                    setDriver(payload.new);
                }
            )
            .subscribe();
    };

    const getStatusStep = () => {
        if (!order) return 0;
        switch (order.status) {
            case 'pending': return 1;
            case 'preparing': return 2; // Hypothetical status
            case 'get_to_deliver': return 3;
            case 'delivered': return 4;
            default: return 1;
        }
    };

    const steps = [
        { label: 'Confirmed', icon: Package, description: 'Order received' },
        { label: 'Preparing', icon: ChefHat, description: 'Packing your items' },
        { label: 'On the Way', icon: Truck, description: 'Driver is nearby' },
        { label: 'Delivered', icon: CheckCircle2, description: 'Enjoy your products!' }
    ];

    if (loading) return (
        <ERPLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        </ERPLayout>
    );

    if (!order) return (
        <ERPLayout>
            <div className="text-center py-20">
                <p>Order not found.</p>
                <Link to="/erp/orders">
                    <Button variant="link">Back to Orders</Button>
                </Link>
            </div>
        </ERPLayout>
    );

    return (
        <ERPLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/erp/orders">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Track Your Order</h1>
                </div>

                {/* Progress Card */}
                <Card className="border-border/50 overflow-hidden">
                    <div className="bg-primary/5 p-6 border-b border-border/50">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Estimated Delivery</p>
                                <h2 className="text-3xl font-bold text-primary">Today</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <p className="font-mono text-xs font-bold">{order.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <div className="relative pt-2 pb-8">
                            <Progress value={(getStatusStep() / 4) * 100} className="h-1.5 bg-primary/20" />
                            <div className="absolute top-0 w-full flex justify-between">
                                {steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = getStatusStep() >= idx + 1;
                                    return (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center -mt-2.5 z-10 transition-colors ${
                                                isActive ? 'bg-primary text-white' : 'bg-background border-2 border-primary/20 text-muted-foreground'
                                            }`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <p className={`text-[10px] mt-2 font-bold uppercase transition-colors ${
                                                isActive ? 'text-primary' : 'text-muted-foreground/60'
                                            }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Items Section */}
                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                                <Package className="w-4 h-4" /> Order Items
                            </h3>
                            <div className="space-y-3">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{item.quantity}x {item.products?.name}</span>
                                        <span className="font-medium text-foreground">₹{item.total_price}</span>
                                    </div>
                                ))}
                                <div className="border-t border-border pt-3 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">₹{order.total_amount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Partner */}
                    {order.status === 'get_to_deliver' && driver ? (
                        <Card className="border-emerald-100 bg-emerald-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900">Delivery Partner</h3>
                                        <p className="text-xs text-emerald-700 font-medium">{driver.full_name} is on the way</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-emerald-800">
                                            <Navigation className="w-4 h-4" />
                                            <span>Vehicle: <span className="font-bold">{driver.vehicle_no}</span></span>
                                        </div>
                                        <a href={`tel:${driver.phone}`}>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-2">
                                                <Phone className="w-3.5 h-3.5" /> Call
                                            </Button>
                                        </a>
                                    </div>
                                    
                                    {/* Mock Map View / Tracking Link */}
                                    <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <MapPin className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-900 uppercase tracking-tight">Live Location Tracking</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                                            Real-time GPS updates are active. Your delivery partner is moving toward your location.
                                        </p>
                                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-emerald-500"
                                                animate={{ x: [-100, 300] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-border/50 bg-secondary/10">
                            <CardContent className="p-6 flex flex-col items-center justify-center py-10 opacity-60">
                                <Clock className="w-10 h-10 text-muted-foreground mb-3" />
                                <h3 className="font-bold text-muted-foreground">Driver Assignment Pending</h3>
                                <p className="text-xs text-muted-foreground text-center">We will notify you once a delivery partner is assigned.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ERPLayout>
    );
};

export default OrderTracking;
