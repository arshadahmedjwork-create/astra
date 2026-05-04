import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Repeat, CheckCircle2, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { Subscription } from '@/types';

const AdminSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    id,
                    quantity,
                    total_price,
                    status,
                    created_at,
                    customers ( customer_id, full_name, mobile ),
                    products ( name, unit )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                const enriched = data.map(sub => {
                    // Safe mapping
                    const customer = Array.isArray(sub.customers) ? sub.customers[0] : sub.customers;
                    const product = Array.isArray(sub.products) ? sub.products[0] : sub.products;
                    return { ...sub, customers: customer, products: product };
                });
                setSubscriptions(enriched);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            toast({ title: 'Success', description: `Subscription marked as ${newStatus}` });
            fetchSubscriptions();
        } catch {
            toast({ title: 'Error', description: 'Failed to update subscription status', variant: 'destructive' });
        }
    };

    const filteredSubs = subscriptions.filter(s =>
        s.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-black text-foreground">Subscriptions</h1>
                <p className="text-muted-foreground mt-1">Manage ongoing and paused product subscriptions</p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by customer, ID, or product..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Product Details</th>
                                <th className="px-4 py-3 font-medium">Amount Req.</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading subscriptions...
                                    </td>
                                </tr>
                            ) : filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Repeat className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p>No subscriptions found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubs.map((sub) => (
                                    <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{sub.customers?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{sub.customers?.customer_id} • {sub.customers?.mobile}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{sub.products?.name}</div>
                                            <div className="text-xs text-muted-foreground">{sub.quantity}x {sub.products?.unit} / delivery</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-primary">₹{sub.total_price}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    sub.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                        'bg-secondary text-secondary-foreground border border-border'
                                                }`}>
                                                {sub.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                                {sub.status === 'paused' && <PauseCircle className="w-3 h-3" />}
                                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {sub.status === 'active' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                                                        onClick={() => handleUpdateStatus(sub.id, 'paused')}
                                                    >
                                                        Pause
                                                    </Button>
                                                ) : sub.status === 'paused' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleUpdateStatus(sub.id, 'active')}
                                                    >
                                                        Resume
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminSubscriptions;
