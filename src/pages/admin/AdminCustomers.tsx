import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, UserRound, Phone, MapPin, Eye, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    id,
                    customer_id,
                    full_name,
                    mobile,
                    created_at,
                    addresses (city, area)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                const enriched = data.map(c => {
                    // Handle array or single object from addresses join
                    const address = Array.isArray(c.addresses) ? c.addresses[0] : c.addresses;
                    return {
                        ...c,
                        address: address || { city: 'N/A', area: 'N/A' }
                    };
                });
                setCustomers(enriched);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile?.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
                <p className="text-muted-foreground mt-1">View and manage all registered customers</p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, ID, or mobile..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        {filteredCustomers.length} Customers
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Customer</th>
                                <th className="px-4 py-3 font-medium">Contact</th>
                                <th className="px-4 py-3 font-medium">Location</th>
                                <th className="px-4 py-3 font-medium">Joined Date</th>
                                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No customers found.</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <UserRound className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{customer.full_name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{customer.customer_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                {customer.mobile}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="line-clamp-1">{customer.address?.area}, {customer.address?.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => setSelectedCustomer(customer)}>
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

            <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Customer Profile</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{selectedCustomer.full_name}</h3>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedCustomer.customer_id}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Mobile Number</p>
                                        <p className="text-sm text-muted-foreground">{selectedCustomer.mobile}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Delivery Address</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCustomer.address?.door_no ? `${selectedCustomer.address.door_no}, ` : ''}
                                            {selectedCustomer.address?.street ? `${selectedCustomer.address.street}, ` : ''}
                                            {selectedCustomer.address?.area}<br />
                                            {selectedCustomer.address?.city} {selectedCustomer.address?.pincode ? `- ${selectedCustomer.address.pincode}` : ''}
                                        </p>
                                        {selectedCustomer.address?.landmark && (
                                            <p className="text-xs text-muted-foreground mt-1">Landmark: {selectedCustomer.address.landmark}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Customer Since</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedCustomer.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCustomers;
