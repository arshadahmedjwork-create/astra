import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import ERPLayout from '@/components/erp/ERPLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    created_at: string;
    status: string;
}

const WalletPage = () => {
    const { customer, refreshProfile } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');

    useEffect(() => {
        if (!customer?.id) return;
        fetchTransactions();
    }, [customer?.id]);

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('customer_id', customer?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    const handleAddFunds = async () => {
        if (!addAmount || isNaN(Number(addAmount))) {
            toast.error('Please enter a valid amount');
            return;
        }

        toast.info('Redirecting to payment gateway...', {
            description: 'This is a mock implementation for now.'
        });

        // Mocking successful update for now
        const { data, error } = await supabase.rpc('add_wallet_funds', {
            cust_id: customer?.id,
            amount_to_add: Number(addAmount),
            desctext: 'Wallet Top-up'
        });

        if (error) {
            toast.error('Failed to add funds: ' + error.message);
        } else {
            toast.success('Funds added successfully!');
            setAddAmount('');
            await refreshProfile();
            fetchTransactions();
        }
    };

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
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-black">₹{customer?.wallet_balance?.toLocaleString() || '0.00'}</span>
                        </div>
                        <p className="mt-4 text-white/60 text-xs italic">
                            *This balance will be used for your daily subscription deductions.
                        </p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quick Add */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card border border-border p-6 rounded-[24px]"
                    >
                        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" /> Add Money
                        </h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Enter Amount"
                                    className="w-full bg-muted/50 border-border rounded-xl px-8 py-3 outline-none focus:ring-2 ring-primary/20 transition-all font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[100, 500, 1000].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setAddAmount(amt.toString())}
                                        className="py-2 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold border border-primary/10 transition-colors"
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                            </div>
                            <Button
                                onClick={handleAddFunds}
                                className="w-full forest-gradient h-12 rounded-xl"
                            >
                                Proceed to Pay
                            </Button>
                        </div>
                    </motion.div>

                    {/* Transaction History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-2 bg-card border border-border p-6 rounded-[24px]"
                    >
                        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-primary" /> Transaction History
                        </h3>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
                                </div>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl group hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{tx.description || 'Transaction'}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black ${
                                                tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </p>
                                            <span className="text-[8px] uppercase font-black text-muted-foreground flex items-center gap-1 justify-end">
                                                <CheckCircle2 size={10} className="text-emerald-500" /> {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-30">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-sm">No transactions found</p>
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
