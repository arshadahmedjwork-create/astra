import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, CreditCard, UserRound, ArrowDownToLine } from 'lucide-react';

const AdminPayments = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    id,
                    transaction_id,
                    amount,
                    payment_date,
                    mode,
                    status,
                    customers (customer_id, full_name, mobile)
                `)
                .order('payment_date', { ascending: false });

            if (error) throw error;

            if (data) {
                const enriched = data.map(payment => {
                    const customer = Array.isArray(payment.customers) ? payment.customers[0] : payment.customers;
                    return { ...payment, customers: customer };
                });
                setPayments(enriched);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment =>
        payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customers?.mobile?.includes(searchQuery)
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
                <p className="text-muted-foreground mt-1">View all transactions completed by customers</p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID, Customer, or Mobile..."
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
                                <th className="px-4 py-3 font-medium">Txn ID & Date</th>
                                <th className="px-4 py-3 font-medium">Customer Details</th>
                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                <th className="px-4 py-3 font-medium text-center">Mode</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p>No payments found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-sm font-medium text-foreground">
                                                {payment.transaction_id || `TXN-${payment.id.split('-')[0].toUpperCase()}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <ArrowDownToLine className="w-3 h-3" />
                                                {new Date(payment.payment_date).toLocaleString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <UserRound className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{payment.customers?.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {payment.customers?.customer_id} • {payment.customers?.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-right text-foreground">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border capitalize inline-block">
                                                {payment.mode.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    payment.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                        payment.status === 'refunded' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                }`}>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
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

export default AdminPayments;
