import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Package, Calendar, Clock, CheckCircle2, XCircle, ChevronRight, Filter, Eye, Truck, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminAllOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
    const [newDriverData, setNewDriverData] = useState({ full_name: '', phone: '', vehicle_no: '' });
    const { toast } = useToast();

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    customers (full_name, mobile, customer_id),
                    order_items (
                        *,
                        products (name)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAddDriver = async () => {
        if (!newDriverData.full_name || !newDriverData.phone) {
            toast({ title: 'Error', description: 'Name and Phone are required.', variant: 'destructive' });
            return;
        }
        try {
            const { error } = await supabase
                .from('drivers')
                .insert([{ ...newDriverData, status: 'active', tracking_active: false }]);

            if (error) throw error;
            
            toast({ title: 'Success', description: 'New driver added successfully.' });
            setIsAddDriverOpen(false);
            setNewDriverData({ full_name: '', phone: '', vehicle_no: '' });
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to add driver.', variant: 'destructive' });
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'get_to_deliver': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customers?.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customers?.mobile?.includes(searchQuery);
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all historical orders across the platform</p>
                </div>
                <Button className="forest-gradient gap-2" onClick={() => setIsAddDriverOpen(true)}>
                    <Users className="w-4 h-4" /> Add Delivery Partner
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Order ID, Name, or Mobile..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-[180px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="get_to_deliver">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center">
                        Total {filteredOrders.length} Orders
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Order Details</th>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground font-mono text-xs">#{order.id.slice(0, 8)}</div>
                                                    <div className="text-xs text-muted-foreground">{order.order_items?.length} items</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{order.customers?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customers?.mobile}</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(order.created_at), 'dd MMM yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-primary">
                                            ₹{order.total_amount}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusStyle(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Order Details - #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Customer</p>
                                    <p className="font-bold">{selectedOrder.customers?.full_name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{selectedOrder.customers?.customer_id}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-muted-foreground">Order Date</p>
                                    <p className="font-bold">{format(new Date(selectedOrder.created_at), 'PPP')}</p>
                                </div>
                            </div>

                            <div className="border border-border rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/30 text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-left">Item</th>
                                            <th className="px-4 py-2 font-medium text-center">Qty</th>
                                            <th className="px-4 py-2 font-medium text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {selectedOrder.order_items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 font-medium">{item.products?.name}</td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">₹{item.total_price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-secondary/10">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 font-bold">Total Amount</td>
                                            <td className="px-4 py-3 text-right font-bold text-primary text-lg">₹{selectedOrder.total_amount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Delivery Method:</span>
                                    <span className="font-medium">Home Delivery</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Quick Add Driver Dialog */}
            <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add New Delivery Partner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="d-name">Full Name</Label>
                            <Input 
                                id="d-name" 
                                placeholder="John Doe" 
                                value={newDriverData.full_name}
                                onChange={(e) => setNewDriverData({...newDriverData, full_name: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="d-phone">Phone Number</Label>
                            <Input 
                                id="d-phone" 
                                placeholder="+91 98765 43210" 
                                value={newDriverData.phone}
                                onChange={(e) => setNewDriverData({...newDriverData, phone: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="d-vehicle">Vehicle Number</Label>
                            <Input 
                                id="d-vehicle" 
                                placeholder="TN-01-AB-1234" 
                                value={newDriverData.vehicle_no}
                                onChange={(e) => setNewDriverData({...newDriverData, vehicle_no: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDriverOpen(false)}>Cancel</Button>
                        <Button onClick={handleQuickAddDriver}>Add Partner</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAllOrders;
