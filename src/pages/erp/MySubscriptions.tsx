import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, Pause, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Subscription {
    id: string;
    product_id: string;
    required_date: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'active' | 'paused' | 'cancelled' | 'completed';
    products: {
        name: string;
        image_url: string;
    } | null;
}

const productImages: Record<string, string> = {
    'Cow Milk': '/assets/product-raw-milk.png',
    'Buffalo Milk': '/assets/product-pasteurized-milk.png',
    'A2 Milk': '/assets/product-homogenized-milk.png',
    'Paneer': '/assets/product-paneer.png',
    'Ghee': '/assets/product-ghee.png',
    'Curd': '/assets/product-curd.png',
    'Buttermilk': '/assets/product-buttermilk.png',
    'Flavoured Milk': '/assets/product-chocolate-milk.png',
    'Natural Kulfi': '/assets/product-kulfi.png',
};

const MySubscriptions = () => {
    const { customer } = useAuthStore();
    const { toast } = useToast();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customer) {
            fetchSubscriptions();
        }
    }, [customer]);

    const fetchSubscriptions = async () => {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    products (name, image_url)
                `)
                .eq('customer_id', customer?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (error: any) {
            toast({
                title: 'Error fetching subscriptions',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            
            setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
            toast({
                title: `Subscription ${newStatus === 'active' ? 'Resumed' : 'Paused'}`,
                description: `Successfully ${newStatus === 'active' ? 'resumed' : 'paused'} your subscription.`,
            });
        } catch (error: any) {
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    return (
        <ERPLayout>
            <div className="max-w-4xl mx-auto text-foreground">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">My Subscriptions</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your recurring daily deliveries
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchSubscriptions} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-secondary/20 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border border-border">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">No active subscriptions</h2>
                        <p className="text-muted-foreground mb-8">Subscribe to products for daily hassle-free delivery.</p>
                        <Button className="forest-gradient">Renew Now</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.map((sub) => (
                            <motion.div
                                key={sub.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-card rounded-3xl border ${sub.status === 'active' ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-border grayscale-[0.5]'} p-6 transition-all group`}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-secondary/30 rounded-2xl overflow-hidden shrink-0 border border-border/50">
                                            <img 
                                                src={productImages[sub.products?.name || ''] || '/assets/product-raw-milk.png'} 
                                                alt={sub.products?.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{sub.products?.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className={`h-2 w-2 rounded-full ${sub.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${sub.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-primary">₹{sub.unit_price}</p>
                                        <p className="text-xs text-muted-foreground font-medium">per day</p>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-secondary/30 p-4 rounded-2xl border border-border/50 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Quantity</span>
                                        <span className="font-bold">{sub.quantity} {sub.products?.name?.includes('Milk') ? 'Litres' : 'Units'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Next Delivery</span>
                                        <span className="font-bold flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            {format(new Date(sub.required_date), 'dd MMM')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => toggleStatus(sub.id, sub.status)}
                                        className={`flex-1 rounded-xl h-12 font-bold ${
                                            sub.status === 'active' 
                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' 
                                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                        }`}
                                    >
                                        {sub.status === 'active' ? (
                                            <><Pause className="w-4 h-4 mr-2" /> Pause</>
                                        ) : (
                                            <><Play className="w-4 h-4 mr-2" /> Resume</>
                                        )}
                                    </Button>
                                    <Button variant="ghost" className="w-12 h-12 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-12 bg-primary/5 rounded-3xl border border-primary/10 p-6 flex gap-4">
                    <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                    <div>
                        <h4 className="font-bold text-primary mb-1 text-sm">Subscription Management Tips</h4>
                        <ul className="text-xs text-primary/80 space-y-1.5 list-disc list-inside">
                            <li>Pause subscriptions before 10:00 PM for next-day effect.</li>
                            <li>Quantity changes take effect from the next delivery cycle.</li>
                            <li>All subscriptions delivered between 5:00 AM and 7:30 AM.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default MySubscriptions;
