import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, Eye, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface Payment {
    id: string;
    order_id: string;
    transaction_id: string;
    amount: number;
    payment_date: string;
    mode: string;
    status: string;
}

const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
};

const PaymentHistory = () => {
    const { customer } = useAuthStore();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [search, setSearch] = useState('');
    const [quickView, setQuickView] = useState<number>(10);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customer?.id) return;

        const fetchPayments = async () => {
            const { data } = await supabase
                .from('payments')
                .select('*')
                .eq('customer_id', customer.id)
                .order('payment_date', { ascending: false });

            if (data) {
                setPayments(data);
                setFilteredPayments(data.slice(0, quickView));
            }
            setLoading(false);
        };
        fetchPayments();
    }, [customer?.id]);

    useEffect(() => {
        let filtered = payments;
        if (search) {
            const q = search.toLowerCase();
            filtered = payments.filter(p =>
                p.order_id?.toLowerCase().includes(q) ||
                p.transaction_id?.toLowerCase().includes(q) ||
                p.amount.toString().includes(q)
            );
        }
        setFilteredPayments(filtered.slice(0, quickView));
    }, [search, quickView, payments]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-primary" />
                        Payment History
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View all your past transactions
                    </p>
                </motion.div>

                {/* Search & Quick View */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-3 mb-6"
                >
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by Order ID, Transaction ID, or Amount..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={quickView === 5 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setQuickView(5)}
                            className="rounded-xl text-xs"
                        >
                            Last 5
                        </Button>
                        <Button
                            variant={quickView === 10 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setQuickView(10)}
                            className="rounded-xl text-xs"
                        >
                            Last 10
                        </Button>
                        <Button
                            variant={quickView === 1000 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setQuickView(1000)}
                            className="rounded-xl text-xs"
                        >
                            All
                        </Button>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-16">
                            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No payment records found</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table Header */}
                            <div className="hidden md:grid grid-cols-[1fr_1.2fr_0.8fr_1fr_1fr_0.8fr_60px] gap-3 p-4 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                <span>Order ID</span>
                                <span>Transaction ID</span>
                                <span>Amount</span>
                                <span>Payment Date</span>
                                <span>Mode</span>
                                <span>Status</span>
                                <span></span>
                            </div>

                            <div className="divide-y divide-border">
                                {filteredPayments.map((payment, i) => (
                                    <div key={payment.id} className="p-4">
                                        {/* Mobile Card */}
                                        <div className="md:hidden space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-foreground">₹{payment.amount.toFixed(2)}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[payment.status] || 'bg-secondary text-foreground'}`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-0.5">
                                                <p>Order: {payment.order_id?.slice(0, 8) || 'N/A'}</p>
                                                <p>Txn: {payment.transaction_id || 'N/A'}</p>
                                                <p>{formatDate(payment.payment_date)} · {payment.mode}</p>
                                            </div>
                                        </div>

                                        {/* Desktop Row */}
                                        <div className="hidden md:grid grid-cols-[1fr_1.2fr_0.8fr_1fr_1fr_0.8fr_60px] gap-3 items-center">
                                            <span className="text-sm text-foreground font-mono truncate">{payment.order_id?.slice(0, 8) || 'N/A'}</span>
                                            <span className="text-sm text-muted-foreground font-mono truncate">{payment.transaction_id || 'N/A'}</span>
                                            <span className="text-sm font-semibold text-foreground">₹{payment.amount.toFixed(2)}</span>
                                            <span className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</span>
                                            <span className="text-sm text-muted-foreground capitalize">{payment.mode.replace('_', ' ')}</span>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize inline-block w-fit ${statusStyles[payment.status] || 'bg-secondary'}`}>
                                                {payment.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedPayment(payment)}
                                                className="text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Payment Detail Modal */}
                <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                        </DialogHeader>
                        {selectedPayment && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Order ID</p>
                                        <p className="font-mono font-medium">{selectedPayment.order_id?.slice(0, 8) || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                                        <p className="font-mono font-medium">{selectedPayment.transaction_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="font-bold text-primary text-lg">₹{selectedPayment.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Date</p>
                                        <p className="font-medium">{formatDate(selectedPayment.payment_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Mode</p>
                                        <p className="font-medium capitalize">{selectedPayment.mode.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[selectedPayment.status] || 'bg-secondary'}`}>
                                            {selectedPayment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ERPLayout>
    );
};

export default PaymentHistory;
