import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, UserRound, Phone, Truck, Plus, MoreVertical, Trash2, Edit2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminDrivers = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        vehicle_no: '',
        status: 'inactive'
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setDrivers(data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing && selectedDriver) {
                const { error } = await supabase
                    .from('drivers')
                    .update(formData)
                    .eq('id', selectedDriver.id);
                if (error) throw error;
                toast.success('Driver updated successfully');
            } else {
                const { error } = await supabase
                    .from('drivers')
                    .insert([formData]);
                if (error) throw error;
                toast.success('Driver added successfully');
            }
            setIsAddDialogOpen(false);
            fetchDrivers();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save driver');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;
        try {
            const { error } = await supabase
                .from('drivers')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Driver deleted successfully');
            fetchDrivers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete driver');
        }
    };

    const resetForm = () => {
        setFormData({ full_name: '', phone: '', vehicle_no: '', status: 'inactive' });
        setIsEditing(false);
        setSelectedDriver(null);
    };

    const openEditDialog = (driver: any) => {
        setSelectedDriver(driver);
        setFormData({
            full_name: driver.full_name,
            phone: driver.phone,
            vehicle_no: driver.vehicle_no,
            status: driver.status
        });
        setIsEditing(true);
        setIsAddDialogOpen(true);
    };

    const filteredDrivers = drivers.filter(d =>
        d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone?.includes(searchQuery) ||
        d.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'busy': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Driver Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your delivery partners and their status</p>
                </div>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Driver
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, or vehicle..."
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
                                <th className="px-4 py-3 font-medium rounded-tl-lg">Driver</th>
                                <th className="px-4 py-3 font-medium">Contact</th>
                                <th className="px-4 py-3 font-medium">Vehicle</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading drivers...
                                    </td>
                                </tr>
                            ) : filteredDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No drivers found.</td>
                                </tr>
                            ) : (
                                filteredDrivers.map((driver) => (
                                    <tr key={driver.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <UserRound className="w-4 h-4" />
                                                </div>
                                                <div className="font-medium text-foreground">{driver.full_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                {driver.phone}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 uppercase text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-3.5 h-3.5" />
                                                {driver.vehicle_no || 'No Vehicle'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(driver.status)}`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(driver)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(driver.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="9988776655"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle">Vehicle Number</Label>
                            <Input
                                id="vehicle"
                                value={formData.vehicle_no}
                                onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                                placeholder="TN-01-AB-1234"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Availability Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Online)</SelectItem>
                                    <SelectItem value="busy">Busy (On Delivery)</SelectItem>
                                    <SelectItem value="inactive">Inactive (Offline)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Driver</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDrivers;
