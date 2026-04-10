import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Calendar as CalendarIcon, MapPin, Truck, CheckCircle2, Search,
    Loader2, ChefHat, Navigation, ChevronLeft, ChevronRight,
    ClipboardList, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, n: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function toDateStr(d: Date) {
    return d.toISOString().split('T')[0];
}

function getNext7Days(from: Date): string[] {
    return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(from, i)));
}

function shortLabel(dateStr: string): { day: string; date: string } {
    const d = new Date(dateStr + 'T00:00:00');
    const today = toDateStr(new Date());
    if (dateStr === today) return { day: 'Today', date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    if (dateStr === toDateStr(addDays(new Date(), 1))) return { day: 'Tomorrow', date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
    return {
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
}

const STATUS_STYLES: Record<string, string> = {
    delivered:     'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    preparing:     'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    pending:       'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    get_to_deliver:'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    planned:       'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminOrders = () => {
    const [searchParams] = useSearchParams();
    const today = toDateStr(new Date());
    const initialDate = searchParams.get('date') || today;

    const [selectedDate,       setSelectedDate]       = useState<string>(initialDate);
    const [searchQuery,        setSearchQuery]         = useState(searchParams.get('id') || '');
    const [orders,             setOrders]              = useState<any[]>([]);
    const [plannedDeliveries,  setPlannedDeliveries]  = useState<any[]>([]);
    const [dayCounts,          setDayCounts]           = useState<Record<string, number>>({});
    const [weekOffset,         setWeekOffset]          = useState(0);
    const [loading,            setLoading]             = useState(true);
    const [drivers,            setDrivers]             = useState<any[]>([]);

    // Assign modal
    const [isAssignModalOpen,  setIsAssignModalOpen]  = useState(false);
    const [orderToAssign,      setOrderToAssign]       = useState<any>(null);   // order OR planned subscription
    const [selectedDriverId,   setSelectedDriverId]    = useState<string>('');
    const [isAddingNewDriver,  setIsAddingNewDriver]   = useState(false);
    const [newDriverData,      setNewDriverData]       = useState({ full_name: '', phone: '', vehicle_no: '' });
    const [assigning,          setAssigning]           = useState(false);

    const { toast } = useToast();
    const isFuture = selectedDate > today;

    // 7 days shown in the strip, sliding by weekOffset
    const stripDays = getNext7Days(addDays(new Date(), weekOffset * 7));

    // ── Load day counts from subscriptions for 7-strip ────────────────────────
    const loadDayCounts = useCallback(async () => {
        const { data } = await supabase
            .from('subscriptions')
            .select('selected_dates')
            .eq('status', 'active');

        if (!data) return;
        const counts: Record<string, number> = {};
        stripDays.forEach(day => {
            counts[day] = data.filter(s =>
                Array.isArray(s.selected_dates) && s.selected_dates.includes(day)
            ).length;
        });
        setDayCounts(counts);
    }, [weekOffset]);

    useEffect(() => { loadDayCounts(); }, [loadDayCounts]);

    // ── Fetch confirmed orders ─────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, order_date, delivery_date, status, total_amount, driver_id, subscription_id,
                    drivers (full_name),
                    customers ( id, customer_id, full_name, mobile ),
                    subscriptions ( id, quantity, product_id )
                `)
                .eq('delivery_date', selectedDate)
                .order('created_at', { ascending: false });

            const [{ data: addressData }, { data: productData }] = await Promise.all([
                supabase.from('addresses').select('*'),
                supabase.from('products').select('*'),
            ]);

            if (error) throw error;

            const enriched = (data || []).map(order => {
                const customer     = Array.isArray(order.customers)    ? order.customers[0]    : order.customers;
                const subscription = Array.isArray(order.subscriptions) ? order.subscriptions[0] : order.subscriptions;
                const address      = addressData?.find(a => a.customer_id === customer?.id) || {};
                let productName = 'Custom Order';
                if (subscription) {
                    const p = productData?.find(p => p.id === subscription.product_id);
                    if (p) productName = `${subscription.quantity}x ${p.name} (${p.unit})`;
                }
                return { ...order, customers: customer, subscriptions: subscription, address, productName, _source: 'order' };
            });

            setOrders(enriched);

            // ── For future dates: also load subscriptions that scheduled this day ──
            if (selectedDate > today) {
                await fetchPlanned(selectedDate, enriched, addressData || [], productData || []);
            } else {
                setPlannedDeliveries([]);
            }
        } catch (err: any) {
            toast({ title: 'Error', description: 'Failed to load delivery sheet.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    // ── Fetch planned deliveries from subscriptions (future-only) ─────────────
    const fetchPlanned = async (date: string, existingOrders: any[], addrs: any[], products: any[]) => {
        const { data: subs } = await supabase
            .from('subscriptions')
            .select('*, customers(id, customer_id, full_name, mobile), products(name, unit, price)')
            .eq('status', 'active')
            .contains('selected_dates', [date]);

        if (!subs) return;

        // Filter out subscriptions that already have an order for this date
        const existingSubIds = new Set(existingOrders.map(o => o.subscriptions?.id || o.subscription_id));
        const planned = subs
            .filter(s => !existingSubIds.has(s.id))
            .map(s => {
                const cust = Array.isArray(s.customers) ? s.customers[0] : s.customers;
                const prod = Array.isArray(s.products)  ? s.products[0]  : s.products;
                const address = addrs.find(a => a.customer_id === cust?.id) || {};
                return {
                    _source:     'planned',
                    _subId:      s.id,
                    id:          `planned-${s.id}`,
                    status:      'planned',
                    customers:   cust,
                    address,
                    productName: `${s.quantity}x ${prod?.name || 'Unknown'} (${prod?.unit || ''})`,
                    total_amount: (s.unit_price || prod?.price || 0) * s.quantity,
                    driver_id:   null,
                    drivers:     null,
                };
            });

        setPlannedDeliveries(planned);
    };

    useEffect(() => {
        fetchOrders();
        fetchDrivers();
    }, [selectedDate]);

    const fetchDrivers = async () => {
        const { data } = await supabase.from('drivers').select('*').eq('status', 'active');
        if (data) setDrivers(data);
    };

    // ── Status update ─────────────────────────────────────────────────────────
    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const updateData: any = { status: newStatus };
            if (newStatus === 'get_to_deliver') updateData.tracking_active = true;
            if (newStatus === 'delivered' || newStatus === 'cancelled') updateData.tracking_active = false;

            const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
            if (error) throw error;

            if (newStatus === 'delivered') {
                const order = orders.find(o => o.id === orderId);
                if (order) await sendDeliveryEmail(order);
            }
            toast({ title: 'Success', description: `Order marked as ${newStatus.replace(/_/g, ' ')}` });
            fetchOrders();
        } catch {
            toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
        }
    };

    // ── Email helper ──────────────────────────────────────────────────────────
    const sendDeliveryEmail = async (order: any) => {
        try {
            const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_DELIVERED_CONFORMED;
            const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
            if (!serviceId || !templateId || !publicKey) return;
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: serviceId, template_id: templateId, user_id: publicKey,
                    template_params: {
                        to_name: order.customers?.full_name,
                        to_email: order.customers?.email || order.customers?.mobile,
                        order_id: order.id, order_total: order.total_amount,
                        product_name: order.productName,
                        message: 'Your order has been successfully delivered. Thank you for choosing Astra Dairy!',
                    },
                }),
            });
        } catch { /* silent */ }
    };

    // ── Add new driver ────────────────────────────────────────────────────────
    const handleQuickAddDriver = async () => {
        if (!newDriverData.full_name || !newDriverData.phone) {
            toast({ title: 'Error', description: 'Name and Phone are required.', variant: 'destructive' });
            return;
        }
        const { data, error } = await supabase
            .from('drivers')
            .insert([{ ...newDriverData, status: 'active', tracking_active: false }])
            .select().single();
        if (error) { toast({ title: 'Error', description: 'Failed to add driver.', variant: 'destructive' }); return; }
        toast({ title: 'Success', description: 'New driver added.' });
        await fetchDrivers();
        setSelectedDriverId(data.id);
        setIsAddingNewDriver(false);
        setNewDriverData({ full_name: '', phone: '', vehicle_no: '' });
    };

    // ── Assign driver (order) ─────────────────────────────────────────────────
    const handleAssignToOrder = async () => {
        if (!orderToAssign || !selectedDriverId) return;
        setAssigning(true);
        try {
            if (orderToAssign._source === 'planned') {
                const sub = orderToAssign;
                
                // ── Check if an order already exists for this subscription and date ──
                const { data: existing } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('subscription_id', sub._subId)
                    .eq('delivery_date', selectedDate)
                    .maybeSingle();

                if (existing) {
                    // Update existing
                    const { error } = await supabase.from('orders')
                        .update({ 
                            driver_id: selectedDriverId, 
                            status: 'get_to_deliver', 
                            tracking_active: true 
                        })
                        .eq('id', existing.id);
                    if (error) throw error;
                    toast({ title: 'Updated!', description: 'Existing order updated with new driver.' });
                } else {
                    // Pre-create the order and assign driver
                    const { error } = await supabase.from('orders').insert({
                        customer_id:     sub.customers?.id,
                        subscription_id: sub._subId,
                        delivery_date:   selectedDate,
                        order_date:      today,
                        status:          'pending',
                        driver_id:       selectedDriverId,
                        tracking_active: true,
                        total_amount:    sub.total_amount,
                    });
                    if (error) throw error;
                    toast({ title: 'Pre-scheduled!', description: 'Order created & driver assigned for ' + selectedDate });
                }
            } else {
                // Normal order: just assign driver
                const { error } = await supabase.from('orders')
                    .update({ driver_id: selectedDriverId, status: 'get_to_deliver', tracking_active: true })
                    .eq('id', orderToAssign.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Driver assigned and tracking activated.' });
            }
            setIsAssignModalOpen(false);
            setSelectedDriverId('');
            fetchOrders();
        } catch (e: any) {
            toast({ title: 'Error', description: e.message || 'Failed to assign driver.', variant: 'destructive' });
        } finally {
            setAssigning(false);
        }
    };

    const allRows = [
        ...orders,
        ...plannedDeliveries,
    ];

    const filteredRows = allRows.filter(o =>
        o.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.address?.area?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingCount   = orders.filter(o => o.status === 'pending' || o.status === 'get_to_deliver' || o.status === 'preparing').length;
    const doneCount      = orders.filter(o => o.status === 'delivered').length;
    const plannedCount   = plannedDeliveries.length;

    return (
        <div className="space-y-6">
            {/* ── Page heading ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Delivery Tracking</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage deliveries · pre-assign drivers for upcoming days
                    </p>
                </div>

                {/* Status summary */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 text-sm">
                    <span className="px-3 py-1.5 text-green-600 font-bold">{doneCount} Done</span>
                    <span className="border-r border-border h-5" />
                    <span className="px-3 py-1.5 text-amber-600 font-bold">{pendingCount} In Progress</span>
                    {plannedCount > 0 && <>
                        <span className="border-r border-border h-5" />
                        <span className="px-3 py-1.5 text-purple-600 font-bold">{plannedCount} Planned</span>
                    </>}
                </div>
            </div>

            {/* ── 7-day strip ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost" size="icon" className="shrink-0"
                    onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 grid grid-cols-7 gap-1.5 overflow-hidden">
                    {stripDays.map(day => {
                        const label    = shortLabel(day);
                        const count    = dayCounts[day] ?? 0;
                        const isActive = selectedDate === day;
                        const isPast   = day < today;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all',
                                    isActive
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : isPast
                                        ? 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                        : 'bg-card border-border hover:border-primary/40 hover:bg-primary/5',
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wide">{label.day}</span>
                                <span className="text-xs font-semibold">{label.date}</span>
                                {count > 0 ? (
                                    <span className={cn(
                                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                        isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
                                    )}>
                                        {count}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground/50">—</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <Button
                    variant="ghost" size="icon" className="shrink-0"
                    onClick={() => setWeekOffset(w => w + 1)}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* ── Banner for future dates ───────────────────────────────────── */}
            {isFuture && (
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl px-4 py-3 text-sm text-purple-700 dark:text-purple-400">
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span>
                        Showing <strong>{plannedCount} scheduled subscription deliveries</strong> for {selectedDate}.
                        Pre-assign drivers now — orders will be confirmed automatically at midnight.
                    </span>
                </div>
            )}

            {/* ── Delivery table ────────────────────────────────────────────── */}
            <Card className="border-border/50 shadow-sm">
                {/* Search + date */}
                <div className="p-4 border-b border-border flex flex-wrap items-center gap-3 bg-secondary/20">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customer, ID, or area…"
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3 py-2 bg-background">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <Input
                            type="date"
                            className="h-7 border-none bg-transparent shadow-none w-[140px] p-0 focus-visible:ring-0"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Delivery Address</th>
                                <th className="px-4 py-3 font-medium">Item</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading…
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                        <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="font-medium">No deliveries for {selectedDate}</p>
                                        <p className="text-xs mt-1">Subscriptions with this date will appear here automatically.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map(row => {
                                    const isPlanned = row._source === 'planned';
                                    return (
                                        <tr
                                            key={row.id}
                                            className={cn(
                                                'border-b border-border/50 transition-colors',
                                                isPlanned
                                                    ? 'bg-purple-50/50 dark:bg-purple-500/5 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                                                    : 'hover:bg-secondary/20',
                                            )}
                                        >
                                            {/* Customer */}
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-foreground">{row.customers?.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{row.customers?.customer_id} · {row.customers?.mobile}</div>
                                            </td>

                                            {/* Address */}
                                            <td className="px-4 py-3 max-w-[220px]">
                                                <div className="flex items-start gap-1.5">
                                                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                                                    <span className="text-xs text-muted-foreground line-clamp-2">
                                                        {[row.address?.door_no, row.address?.street, row.address?.area, row.address?.city].filter(Boolean).join(', ')}
                                                        {row.address?.pincode ? ` - ${row.address.pincode}` : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Item */}
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{row.productName}</div>
                                                <div className="text-xs font-semibold text-primary">₹{row.total_amount}</div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    'px-2.5 py-1 text-xs font-semibold rounded-full',
                                                    STATUS_STYLES[row.status] || 'bg-secondary text-secondary-foreground',
                                                )}>
                                                    {row.status === 'planned' ? 'Planned' : row.status.replace(/_/g, ' ')}
                                                </span>
                                                {row.drivers?.full_name && (
                                                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Truck className="w-3 h-3" />{row.drivers.full_name}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    {isPlanned ? (
                                                        /* Planned → Pre-assign driver */
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-purple-600 hover:bg-purple-700 text-white"
                                                            onClick={() => {
                                                                setOrderToAssign(row);
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Pre-assign Driver
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {row.status === 'pending' && (
                                                                <Button size="sm" variant="outline"
                                                                    className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50"
                                                                    onClick={() => handleUpdateStatus(row.id, 'preparing')}>
                                                                    <ChefHat className="w-3.5 h-3.5 mr-1.5" />Start Prep
                                                                </Button>
                                                            )}
                                                            {(row.status === 'pending' || row.status === 'preparing') && (
                                                                <Button size="sm" variant="outline"
                                                                    className="h-8 border-primary text-primary hover:bg-primary/10"
                                                                    onClick={() => { setOrderToAssign(row); setIsAssignModalOpen(true); }}>
                                                                    <Truck className="w-3.5 h-3.5 mr-1.5" />Assign Driver
                                                                </Button>
                                                            )}
                                                            {row.status !== 'delivered' && (
                                                                <Button size="sm"
                                                                    className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                                                    onClick={() => handleUpdateStatus(row.id, 'delivered')}>
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Delivered
                                                                </Button>
                                                            )}
                                                            {row.status === 'get_to_deliver' && (
                                                                <Link to={`/admin/orders/track/${row.id}`} target="_blank">
                                                                    <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:bg-blue-50">
                                                                        <Navigation className="w-3.5 h-3.5 mr-1.5" />Track
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {row.status === 'delivered' && (
                                                                <Button size="sm" variant="outline"
                                                                    className="h-8 text-muted-foreground"
                                                                    onClick={() => handleUpdateStatus(row.id, 'get_to_deliver')}>
                                                                    Undo
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ── Assign / Pre-schedule Driver Modal ───────────────────────── */}
            <Dialog open={isAssignModalOpen} onOpenChange={v => { setIsAssignModalOpen(v); if (!v) { setIsAddingNewDriver(false); setSelectedDriverId(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {orderToAssign?._source === 'planned'
                                ? `Pre-schedule & Assign Driver — ${selectedDate}`
                                : 'Assign Driver to Order'}
                        </DialogTitle>
                    </DialogHeader>

                    {orderToAssign?._source === 'planned' && (
                        <div className="text-sm text-muted-foreground bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-lg px-4 py-3 mb-2">
                            <strong>{orderToAssign.customers?.full_name}</strong> — {orderToAssign.productName}<br />
                            This will create the order record now so the driver is ready ahead of time.
                        </div>
                    )}

                    <div className="py-3 space-y-4">
                        {!isAddingNewDriver ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Driver</Label>
                                    <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a driver…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map(d => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.full_name} {d.vehicle_no ? `(${d.vehicle_no})` : ''}
                                                </SelectItem>
                                            ))}
                                            {drivers.length === 0 && (
                                                <SelectItem value="none" disabled>No active drivers</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="link" className="p-0 h-auto text-xs text-primary"
                                    onClick={() => setIsAddingNewDriver(true)}>
                                    + Add New Delivery Partner
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3 border p-3 rounded-lg bg-secondary/10">
                                <h4 className="text-sm font-bold">New Delivery Partner</h4>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-name">Name *</Label>
                                    <Input id="q-name" placeholder="Full Name"
                                        value={newDriverData.full_name}
                                        onChange={e => setNewDriverData(d => ({ ...d, full_name: e.target.value }))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-phone">Phone *</Label>
                                    <Input id="q-phone" placeholder="Phone Number"
                                        value={newDriverData.phone}
                                        onChange={e => setNewDriverData(d => ({ ...d, phone: e.target.value }))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-vehicle">Vehicle No</Label>
                                    <Input id="q-vehicle" placeholder="TN-01-AB-1234"
                                        value={newDriverData.vehicle_no}
                                        onChange={e => setNewDriverData(d => ({ ...d, vehicle_no: e.target.value }))} />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => setIsAddingNewDriver(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleQuickAddDriver}>Add Driver</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Close</Button>
                        {!isAddingNewDriver && (
                            <Button
                                onClick={handleAssignToOrder}
                                disabled={!selectedDriverId || assigning}
                                className={orderToAssign?._source === 'planned' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                            >
                                {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {orderToAssign?._source === 'planned' ? 'Pre-schedule & Assign' : 'Assign & Start Tracking'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrders;
