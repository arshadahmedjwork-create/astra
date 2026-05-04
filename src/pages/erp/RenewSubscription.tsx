import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, Trash2, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ERPLayout from '@/components/erp/ERPLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { generateDatesFromFrequency } from '@/lib/subscriptionUtils';
import { useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { Subscription } from '@/types';
import 'react-day-picker/dist/style.css';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    purchase_type?: 'daily' | 'subscription' | 'both';
}

interface SubscriptionRow {
    id: string;
    category: string;
    productId: string;
    frequencyType: 'daily' | 'alternate' | 'weekdays' | 'custom';
    startDate: string;
    endDate: string;
    unitPrice: number;
    quantity: number;
    price: number;
    customDates?: string[];
}

const RenewSubscription = () => {
    const { customer } = useAuthStore();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [rows, setRows] = useState<SubscriptionRow[]>([]);
    const [existingSubscriptions, setExistingSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchInitialData = useCallback(async () => {
        if (!customer?.id) return;
        setLoading(true);

        // Fetch Products
        const { data: prodData } = await supabase
            .from('products')
            .select('id, name, category, price, unit, purchase_type')
            .eq('active', true)
            .in('purchase_type', ['subscription', 'both']);

        if (prodData) {
            setProducts(prodData);
            const cats = [...new Set(prodData.map(p => p.category))];
            setCategories(cats);
            // Only add row if none exist
            setRows(prev => prev.length === 0 ? [{
                id: crypto.randomUUID(),
                category: '',
                productId: '',
                frequencyType: 'daily',
                startDate: '',
                endDate: '',
                unitPrice: 0,
                quantity: 1,
                price: 0,
                customDates: [],
            }] : prev);
        }

        // Fetch Existing Subscriptions
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('*, products(name, unit)')
            .eq('customer_id', customer.id);
        
        if (subData) setExistingSubscriptions(subData);
        
        setLoading(false);
    }, [customer?.id]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const addRow = (prods?: Product[]) => {
        const id = crypto.randomUUID();
        setRows(prev => [...prev, {
            id,
            category: '',
            productId: '',
            frequencyType: 'daily',
            startDate: '',
            endDate: '',
            unitPrice: 0,
            quantity: 1,
            price: 0,
            customDates: [],
        }]);
    };

    const updateRow = (id: string, field: string, value: string | number) => {
        setRows(prev => prev.map(row => {
            if (row.id !== id) return row;
            const updated = { ...row, [field]: value };

            if (field === 'productId') {
                const product = products.find(p => p.id === value);
                if (product) {
                    updated.unitPrice = product.price;
                    updated.price = product.price * updated.quantity;

                    // Milk Logic: Lock to 1 month duration
                    if (product.category === 'Milk' && updated.startDate) {
                        const start = new Date(updated.startDate + 'T00:00:00');
                        const end = new Date(start);
                        end.setMonth(start.getMonth() + 1);
                        updated.endDate = end.toISOString().split('T')[0];
                    }
                }
            }

            if (field === 'startDate' && updated.productId) {
                const product = products.find(p => p.id === updated.productId);
                if (product?.category === 'Milk') {
                    const start = new Date(value + 'T00:00:00');
                    const end = new Date(start);
                    end.setMonth(start.getMonth() + 1);
                    updated.endDate = end.toISOString().split('T')[0];
                }
            }
            if (field === 'quantity') {
                updated.price = updated.unitPrice * (value as number);
            }

            return updated;
        }));
    };

    const removeRow = (id: string) => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const totalPrice = rows.reduce((sum, r) => sum + r.price, 0);

    const handleSubmit = async () => {
        if (!customer?.id) return;

        const validRows = rows.filter(r => r.productId && r.startDate && r.endDate && r.quantity > 0);
        if (validRows.length === 0) {
            toast({ title: 'No items', description: 'Please add at least one product with a date range.', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            const subscriptions = validRows.map(r => {
                const selectedDates = r.frequencyType !== 'custom'
                    ? generateDatesFromFrequency(
                        new Date(r.startDate + 'T00:00:00'),
                        new Date(r.endDate   + 'T00:00:00'),
                        r.frequencyType,
                    )
                    : r.customDates || [];
                return {
                    customer_id:    customer!.id,
                    product_id:     r.productId,
                    frequency_type: r.frequencyType,
                    selected_dates: selectedDates,
                    start_date:     r.startDate,
                    end_date:       r.endDate,
                    required_date:  r.startDate,
                    unit_price:     r.unitPrice,
                    quantity:       r.quantity,
                    status:         'active',
                };
            });

            const { error } = await supabase.from('subscriptions').insert(subscriptions);

            if (error) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            } else {
                // Send Confirmation Email
                const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_CONFORMED;
                const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                if (serviceId && templateId && publicKey) {
                    const productDetails = validRows.map(r => {
                        const p = products.find(prod => prod.id === r.productId);
                        return `${p?.name} (${r.quantity} x ₹${r.unitPrice})`;
                    }).join('\n');

                    fetch('https://api.emailjs.com/api/v1.0/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            service_id: serviceId,
                            template_id: templateId,
                            user_id: publicKey,
                            template_params: {
                                to_name: customer?.full_name,
                                to_email: customer?.email,
                                order_total: totalPrice,
                                product_details: productDetails,
                                message: "Your weekly subscription has been successfully created. You will receive fresh deliveries on your selected dates."
                            },
                        }),
                    }).catch(e => console.error('Subscription email failed:', e));
                }

                toast({ title: 'Subscription Created! 🎉', description: `${validRows.length} product(s) subscribed successfully.` });
                setRows([]);
                addRow();
            }
        } catch {
            toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
        }
        setSubmitting(false);
    };

    const handleTogglePause = async (sub: Subscription) => {
        const newStatus = sub.status === 'paused' ? 'active' : 'paused';
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: newStatus })
            .eq('id', sub.id);
        
        if (!error) {
            setExistingSubscriptions(prev => prev.map(s => 
                s.id === sub.id ? { ...s, status: newStatus } : s
            ));
            toast({ title: 'Status Updated', description: `Subscription is now ${newStatus}.` });
        }
    };

    return (
        <ERPLayout>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-foreground flex items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-primary" />
                        Renew Subscription
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create recurring delivery orders for your favorite products
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                        {/* Table Header - Desktop */}
                        <div className="hidden md:grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.6fr_0.8fr_50px] gap-3 p-4 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <span>Category</span>
                            <span>Product</span>
                            <span>Required Date</span>
                            <span>Unit Price</span>
                            <span>Qty</span>
                            <span>Price</span>
                            <span></span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-border">
                            {rows.map((row, i) => (
                                <div key={row.id} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr_0.8fr_0.6fr_0.8fr_50px] gap-3 items-center">
                                        {/* Category */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Category</label>
                                            <Select value={row.category} onValueChange={(v) => updateRow(row.id, 'category', v)}>
                                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Product */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Product</label>
                                            <Select value={row.productId} onValueChange={(v) => updateRow(row.id, 'productId', v)}>
                                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Product" /></SelectTrigger>
                                                <SelectContent>
                                                    {products
                                                        .filter(p => !row.category || p.category === row.category)
                                                        .map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Frequency */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Frequency</label>
                                            <Select value={row.frequencyType} onValueChange={(v) => updateRow(row.id, 'frequencyType', v)}>
                                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Frequency" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="alternate">Alternate Days</SelectItem>
                                                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                                                    <SelectItem value="custom">Custom Dates</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Date Range or Custom Dates Picker */}
                                        <div className="flex gap-1">
                                            {row.frequencyType === 'custom' ? (
                                                <div className="flex-1 relative">
                                                    <label className="text-xs text-muted-foreground md:hidden mb-1 block">Custom Dates</label>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" className="h-9 w-full text-xs gap-2 justify-start px-2 overflow-hidden bg-background">
                                                                <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                                                                <span className="truncate">{row.customDates?.length ? `${row.customDates.length} days selected` : 'Pick Dates'}</span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[400px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Select Delivery Dates</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="p-4 flex justify-center">
                                                                <DayPicker
                                                                    mode="multiple"
                                                                    min={1}
                                                                    selected={row.customDates?.map(d => new Date(d + 'T00:00:00'))}
                                                                    onSelect={(days) => {
                                                                        const dayStrings = (days || []).map(d => d.toISOString().split('T')[0]).sort();
                                                                        updateRow(row.id, 'customDates', dayStrings);
                                                                        if (dayStrings.length) {
                                                                            updateRow(row.id, 'startDate', dayStrings[0]);
                                                                            updateRow(row.id, 'endDate', dayStrings[dayStrings.length - 1]);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground md:hidden mb-1 block">Start</label>
                                                        <Input
                                                            type="date"
                                                            value={row.startDate}
                                                            onChange={(e) => updateRow(row.id, 'startDate', e.target.value)}
                                                            className="h-9 text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-muted-foreground md:hidden mb-1 block">End</label>
                                                        <Input
                                                            type="date"
                                                            min={row.startDate}
                                                            value={row.endDate}
                                                            onChange={(e) => updateRow(row.id, 'endDate', e.target.value)}
                                                            className="h-9 text-xs"
                                                            disabled={row.category === 'Milk'}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Unit Price */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Unit Price</label>
                                            <div className="h-9 flex items-center text-sm font-medium text-foreground px-3 bg-secondary/30 rounded-md">
                                                ₹{row.unitPrice.toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Qty</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={row.quantity}
                                                onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 1)}
                                                className="h-9 text-sm"
                                            />
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="text-xs text-muted-foreground md:hidden mb-1 block">Price</label>
                                            <div className="h-9 flex items-center text-sm font-bold text-primary px-3">
                                                ₹{row.price.toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => removeRow(row.id)}
                                            className="text-destructive/60 hover:text-destructive transition-colors self-center"
                                            disabled={rows.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add More + Total */}
                        <div className="p-4 border-t border-border bg-secondary/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addRow()}
                                    className="rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add More
                                </Button>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Total Price</p>
                                        <p className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</p>
                                    </div>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="forest-gradient text-primary-foreground rounded-xl h-11 px-8 font-semibold"
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Subscribing...</>
                                        ) : (
                                            'Subscribe Now'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Existing Subscriptions Section */}
                {!loading && existingSubscriptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12"
                    >
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Your Active Subscriptions
                        </h2>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Product</th>
                                            <th className="px-6 py-3">Frequency</th>
                                            <th className="px-6 py-3">Qty</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {existingSubscriptions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{sub.products?.name}</div>
                                                    <div className="text-xs text-muted-foreground">₹{sub.unit_price}/{sub.products?.unit}</div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    Next: {new Date(sub.required_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    {sub.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        sub.status === 'paused' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTogglePause(sub)}
                                                        className={sub.status === 'paused' ? 'text-green-600' : 'text-orange-600'}
                                                    >
                                                        {sub.status === 'paused' ? 'Resume' : 'Pause'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ERPLayout>
    );
};

export default RenewSubscription;
