import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, MapPin, Truck, CheckCircle2, Search, Loader2, User, ChefHat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminOrders = () => {
    const [searchParams] = useSearchParams();
    const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const initialId = searchParams.get('id') || '';

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(initialDate);
    const [searchQuery, setSearchQuery] = useState(initialId);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [orderToAssign, setOrderToAssign] = useState<any>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [isAddingNewDriver, setIsAddingNewDriver] = useState(false);
    const [newDriverData, setNewDriverData] = useState({ full_name: '', phone: '', vehicle_no: '' });
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
        fetchDrivers();
    }, [selectedDate]);

    const fetchDrivers = async () => {
        const { data } = await supabase.from('drivers').select('*').eq('status', 'active');
        if (data) setDrivers(data);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_date,
                    delivery_date,
                    status,
                    total_amount,
                    driver_id,
                    drivers (full_name),
                    customers ( id, customer_id, full_name, mobile ),
                    subscriptions ( quantity, product_id ),
                    addresses:customers(id)
                `)
                .eq('delivery_date', selectedDate)
                .order('created_at', { ascending: false });

            // We also need to fetch addresses and products to enrich the data
            // For a production app, a proper view or RPC is better.
            const { data: addressData } = await supabase.from('addresses').select('*');
            const { data: productData } = await supabase.from('products').select('*');

            if (error) throw error;

            if (data) {
                // Enrich orders with address and product info
                // Supabase joins without `.single()` can return arrays, so safely fallback
                const enriched = data.map(order => {
                    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
                    const subscription = Array.isArray(order.subscriptions) ? order.subscriptions[0] : order.subscriptions;

                    const customerAddress = addressData?.find(a => a.customer_id === customer?.id) || {};
                    let productName = 'Custom Order';
                    if (subscription) {
                        const product = productData?.find(p => p.id === subscription.product_id);
                        if (product) productName = `${subscription.quantity}x ${product.name} (${product.unit})`;
                    }

                    return {
                        ...order,
                        customers: customer, // override with single object
                        subscriptions: subscription, // override with single object
                        address: customerAddress,
                        productName
                    };
                });
                setOrders(enriched);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to load delivery sheet.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const sendDeliveryEmail = async (order: any) => {
        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_DELIVERED_CONFORMED;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                console.error('EmailJS credentials missing');
                return;
            }

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: {
                        to_name: order.customers?.full_name,
                        to_email: order.customers?.email || order.customers?.mobile, // Mobile if no email
                        order_id: order.id,
                        order_total: order.total_amount,
                        product_name: order.productName,
                        message: "Your order has been successfully delivered. Thank you for choosing Astra Dairy!"
                    },
                }),
            });
        } catch (error) {
            console.error('Failed to send delivery email:', error);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const updateData: any = { status: newStatus };
            if (newStatus === 'get_to_deliver') {
                updateData.tracking_active = true;
            } else if (newStatus === 'delivered' || newStatus === 'cancelled') {
                updateData.tracking_active = false;
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) throw error;

            if (newStatus === 'delivered') {
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    await sendDeliveryEmail(order);
                }
            }

            toast({ title: 'Success', description: `Order marked as ${newStatus.replace(/_/g, ' ')}` });
            fetchOrders(); // Refresh
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
        }
    };

    const handleQuickAddDriver = async () => {
        if (!newDriverData.full_name || !newDriverData.phone) {
            toast({ title: 'Error', description: 'Name and Phone are required.', variant: 'destructive' });
            return;
        }
        try {
            const { data, error } = await supabase
                .from('drivers')
                .insert([{ ...newDriverData, status: 'active', tracking_active: false }])
                .select()
                .single();

            if (error) throw error;
            
            toast({ title: 'Success', description: 'New driver added and active.' });
            await fetchDrivers(); // Refresh list
            setSelectedDriverId(data.id); // Select the new driver
            setIsAddingNewDriver(false); // Hide form
            setNewDriverData({ full_name: '', phone: '', vehicle_no: '' }); // Reset
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to add driver.', variant: 'destructive' });
        }
    };

    const handleAssignDriver = async () => {
        if (!orderToAssign || !selectedDriverId) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ 
                    driver_id: selectedDriverId,
                    status: 'get_to_deliver',
                    tracking_active: true
                })
                .eq('id', orderToAssign.id);

            if (error) throw error;
            
            // Mark driver as busy (optional)
            // await supabase.from('drivers').update({ status: 'busy' }).eq('id', selectedDriverId);

            toast({ title: 'Success', description: 'Driver assigned and tracking activated.' });
            setIsAssignModalOpen(false);
            fetchOrders();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to assign driver.', variant: 'destructive' });
        }
    };

    const filteredOrders = orders.filter(
        (o) =>
            o.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.address?.area?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingDeliveries = orders.filter(o => o.status === 'pending' || o.status === 'get_to_deliver').length;
    const completedDeliveries = orders.filter(o => o.status === 'delivered').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Delivery Tracking</h1>
                    <p className="text-muted-foreground mt-1">Manage today's deliveries and routes</p>
                </div>

                <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
                    <div className="px-3 py-2 flex items-center gap-2 text-sm font-medium border-r border-border">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <Input
                            type="date"
                            className="h-8 border-none bg-transparent shadow-none w-[140px] p-0 focus-visible:ring-0 cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="px-4 py-1 text-sm">
                        <span className="text-green-600 font-bold">{completedDeliveries}</span> <span className="text-muted-foreground">Done</span>
                        <span className="mx-2 text-border">|</span>
                        <span className="text-amber-600 font-bold">{pendingDeliveries}</span> <span className="text-muted-foreground">Left</span>
                    </div>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by customer, ID, or area..."
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
                                <th className="px-4 py-3 font-medium">Delivery Address</th>
                                <th className="px-4 py-3 font-medium">Order Item</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading delivery sheet...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                        <p>No deliveries scheduled for {selectedDate}.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{order.customers?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customers?.customer_id} • {order.customers?.mobile}</div>
                                        </td>
                                        <td className="px-4 py-3 max-w-[250px]">
                                            <div className="flex items-start gap-1.5 line-clamp-2">
                                                <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                                                <span className="text-xs text-muted-foreground">
                                                    {order.address?.door_no ? `${order.address.door_no}, ` : ''}
                                                    {order.address?.street ? `${order.address.street}, ` : ''}
                                                    {order.address?.area ? `${order.address.area}, ` : ''}
                                                    {order.address?.city} - {order.address?.pincode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-sm">{order.productName}</div>
                                            <div className="text-xs font-semibold text-primary">₹{order.total_amount}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                order.status === 'preparing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                order.status === 'pending' || order.status === 'get_to_deliver' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                    'bg-secondary text-secondary-foreground border border-border'
                                                }`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50"
                                                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                    >
                                                        <ChefHat className="w-3.5 h-3.5 mr-1.5" />
                                                        Start Preparing
                                                    </Button>
                                                )}
                                                {(order.status === 'pending' || order.status === 'preparing') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 border-primary text-primary hover:bg-primary/10"
                                                        onClick={() => {
                                                            setOrderToAssign(order);
                                                            setIsAssignModalOpen(true);
                                                        }}
                                                    >
                                                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                                                        Assign Driver
                                                    </Button>
                                                )}
                                                {order.status !== 'delivered' && (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                        Mark Delivered
                                                    </Button>
                                                )}
                                                {order.status === 'delivered' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-border text-muted-foreground hover:text-foreground rounded-lg px-3"
                                                        onClick={() => handleUpdateStatus(order.id, 'get_to_deliver')}
                                                    >
                                                        Undo
                                                    </Button>
                                                )}
                                            </div>
                                            {order.drivers?.full_name && (
                                                <div className="text-[10px] text-right mt-1 text-muted-foreground">
                                                    Driver: <span className="font-bold text-primary">{order.drivers.full_name}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Driver to Order</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {!isAddingNewDriver ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Available Driver</Label>
                                    <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a driver..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map((driver) => (
                                                <SelectItem key={driver.id} value={driver.id}>
                                                    {driver.full_name} ({driver.vehicle_no})
                                                </SelectItem>
                                            ))}
                                            {drivers.length === 0 && (
                                                <SelectItem value="none" disabled>No active drivers available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto text-xs text-primary" 
                                    onClick={() => setIsAddingNewDriver(true)}
                                >
                                    + Add New Delivery Partner
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 border p-3 rounded-lg bg-secondary/10">
                                <h4 className="text-sm font-bold">New Delivery Partner</h4>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-name">Name</Label>
                                    <Input 
                                        id="q-name" 
                                        placeholder="Full Name" 
                                        value={newDriverData.full_name}
                                        onChange={(e) => setNewDriverData({...newDriverData, full_name: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-phone">Phone</Label>
                                    <Input 
                                        id="q-phone" 
                                        placeholder="Phone Number" 
                                        value={newDriverData.phone}
                                        onChange={(e) => setNewDriverData({...newDriverData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="q-vehicle">Vehicle No</Label>
                                    <Input 
                                        id="q-vehicle" 
                                        placeholder="TN-01-AB-1234" 
                                        value={newDriverData.vehicle_no}
                                        onChange={(e) => setNewDriverData({...newDriverData, vehicle_no: e.target.value})}
                                    />
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
                            <Button onClick={handleAssignDriver} disabled={!selectedDriverId}>Assign & Start Tracking</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrders;
