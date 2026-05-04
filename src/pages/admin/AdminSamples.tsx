import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, FlaskConical, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { SampleRequest } from '@/types';

const AdminSamples = () => {
    const [samples, setSamples] = useState<SampleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchSamples();
    }, [fetchSamples]);

    const fetchSamples = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sample_requests')
                .select(`
                    id,
                    status,
                    requested_at,
                    customers ( customer_id, full_name, mobile ),
                    products ( name, unit )
                `)
                .order('requested_at', { ascending: false });

            if (error) throw error;
            if (data) {
                const enriched = data.map(sample => {
                    const customer = Array.isArray(sample.customers) ? sample.customers[0] : sample.customers;
                    const product = Array.isArray(sample.products) ? sample.products[0] : sample.products;
                    return { ...sample, customers: customer, products: product };
                });
                setSamples(enriched);
            }
        } catch (error) {
            console.error('Error fetching sample requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('sample_requests').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            toast({ title: 'Success', description: `Sample request marked as ${newStatus}` });
            fetchSamples();
        } catch {
            toast({ title: 'Error', description: 'Failed to update request status', variant: 'destructive' });
        }
    };

    const filteredSamples = samples.filter(s =>
        s.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-black text-foreground">Sample Requests</h1>
                <p className="text-muted-foreground mt-1">Manage one-time trial requests from leads</p>
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
                                <th className="px-4 py-3 font-medium">Customer Details</th>
                                <th className="px-4 py-3 font-medium">Requested Product</th>
                                <th className="px-4 py-3 font-medium">Request Date</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : filteredSamples.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p>No sample requests found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSamples.map((sample) => (
                                    <tr key={sample.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{sample.customers?.full_name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                {sample.customers?.customer_id}
                                                <span className="mx-1">•</span>
                                                <Phone className="w-3 h-3" /> {sample.customers?.mobile}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{sample.products?.name}</div>
                                            <div className="text-xs text-muted-foreground">Sample Unit</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(sample.requested_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${sample.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    sample.status === 'requested' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                        'bg-secondary text-secondary-foreground border border-border'
                                                }`}>
                                                {sample.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                                                {sample.status.charAt(0).toUpperCase() + sample.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {sample.status === 'requested' ? (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                                                        onClick={() => handleUpdateStatus(sample.id, 'delivered')}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                        Mark Delivered
                                                    </Button>
                                                ) : sample.status === 'delivered' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-border text-muted-foreground hover:text-foreground rounded-lg px-3"
                                                        onClick={() => handleUpdateStatus(sample.id, 'requested')}
                                                    >
                                                        Undo
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

export default AdminSamples;
