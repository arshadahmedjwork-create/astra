import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, History, ArrowUpRight, ArrowDownLeft,
    AlertCircle, CheckCircle2, Clock, PhoneCall
} from 'lucide-react';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    created_at: string;
    status: string;
}

const WalletPage = () => {
    const { customer } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!customer?.id) return;
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    }, [customer?.id]);

    useEffect(() => {
        if (!customer?.id) return;
        fetchTransactions();
    }, [customer?.id, fetchTransactions]);

    return (
        <ERPLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="forest-gradient p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                            <Wallet className="w-5 h-5" aria-hidden="true" />
                            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-black">
                                ₹{customer?.wallet_balance?.toLocaleString('en-IN') ?? '0.00'}
                            </span>
                        </div>
                        <p className="mt-4 text-white/60 text-xs italic">
                            *This balance is used for your daily subscription deductions.
                        </p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" aria-hidden="true" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top-up notice — gateway deferred */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card border border-border p-6 rounded-[24px] flex flex-col gap-4"
                    >
                        <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                            <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                            Add Money
                        </h3>

                        {/* ── PAYMENT GATEWAY DEFERRED NOTICE ─────────────────────
                            Online wallet top-up has been intentionally disabled until
                            a verified payment gateway (Razorpay / Stripe) is integrated.
                            DO NOT re-enable the RPC call here without a real payment intent.
                        ─────────────────────────────────────────────────────────── */}
                        <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                            <Clock className="w-7 h-7 text-amber-500" aria-hidden="true" />
                            <p className="text-sm font-bold text-amber-800">
                                Online top-up coming soon
                            </p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Wallet recharges via UPI, cards, or net banking will be available
                                shortly. Until then, please use <strong>Cash on Delivery</strong> at checkout.
                            </p>
                        </div>

                        <a
                            href="tel:+918056000000"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
                        >
                            <PhoneCall className="w-4 h-4" aria-hidden="true" />
                            Contact support
                        </a>
                    </motion.div>

                    {/* Transaction History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-2 bg-card border border-border p-6 rounded-[24px]"
                    >
                        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-primary" aria-hidden="true" />
                            Transaction History
                        </h3>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="space-y-2" aria-label="Loading transactions">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                                    ))}
                                </div>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    tx.type === 'credit'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-red-100 text-red-600'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {tx.type === 'credit'
                                                    ? <ArrowDownLeft className="w-5 h-5" />
                                                    : <ArrowUpRight className="w-5 h-5" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {tx.description || 'Transaction'}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </p>
                                            <span className="text-[8px] uppercase font-black text-muted-foreground flex items-center gap-1 justify-end">
                                                <CheckCircle2 size={10} className="text-emerald-500" aria-hidden="true" />
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-40" role="status">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-2" aria-hidden="true" />
                                    <p className="text-sm">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </ERPLayout>
    );
};

export default WalletPage;
