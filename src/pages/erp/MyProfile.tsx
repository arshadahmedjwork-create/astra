import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    User, Camera, Lock, MapPin, Phone, Mail, Calendar,
    Edit3, Save, X, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ERPLayout from '@/components/erp/ERPLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const MyProfile = () => {
    const { customer, setCustomer } = useAuthStore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Editable fields
    const [altMobile, setAltMobile] = useState(customer?.address?.alt_mobile || '');
    const [doorNo, setDoorNo] = useState(customer?.address?.door_no || '');
    const [street, setStreet] = useState(customer?.address?.street || '');
    const [landmark, setLandmark] = useState(customer?.address?.landmark || '');
    const [area, setArea] = useState(customer?.address?.area || '');
    const [pincode, setPincode] = useState(customer?.address?.pincode || '');
    const [state, setState] = useState(customer?.address?.state || 'Tamil Nadu');
    const [city, setCity] = useState(customer?.address?.city || 'Chennai');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !customer?.id) return;

        try {
            const imageCompression = (await import('browser-image-compression')).default;
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            });

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                const { error } = await supabase
                    .from('customers')
                    .update({ photo_base64: base64 })
                    .eq('id', customer.id);

                if (error) {
                    toast({ title: 'Error', description: 'Failed to update photo.', variant: 'destructive' });
                } else {
                    setCustomer({ ...customer, photo_base64: base64 });
                    toast({ title: 'Photo updated!', description: 'Your profile photo has been changed.' });
                }
            };
            reader.readAsDataURL(compressed);
        } catch {
            toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
        }
    };

    const handleSaveAddress = async () => {
        if (!customer?.address?.id) return;
        setSaving(true);

        const { error } = await supabase
            .from('addresses')
            .update({
                alt_mobile: altMobile || null,
                door_no: doorNo || null,
                street: street || null,
                landmark,
                area,
                pincode,
                state,
                city,
            })
            .eq('id', customer.address.id);

        if (error) {
            toast({ title: 'Error', description: 'Failed to update address.', variant: 'destructive' });
        } else {
            setCustomer({
                ...customer,
                address: {
                    ...customer.address,
                    alt_mobile: altMobile,
                    door_no: doorNo,
                    street,
                    landmark,
                    area,
                    pincode,
                    state,
                    city,
                },
            });
            setEditing(false);
            toast({ title: 'Address updated!', description: 'Your address has been saved.' });
        }
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 8) {
            toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
            return;
        }
        if (!customer?.id) return;

        setSaving(true);
        try {
            const bcrypt = await import('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            const { error } = await supabase
                .from('customers')
                .update({ password_hash: hash })
                .eq('id', customer.id);

            if (error) {
                toast({ title: 'Error', description: 'Failed to update password.', variant: 'destructive' });
            } else {
                setChangingPassword(false);
                setOldPassword('');
                setNewPassword('');
                toast({ title: 'Password changed!', description: 'Your password has been updated.' });
            }
        } catch {
            toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
        }
        setSaving(false);
    };

    if (!customer) return null;

    return (
        <ERPLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                        <User className="w-7 h-7 text-primary" />
                        My Profile
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage your personal information
                    </p>
                </motion.div>

                {/* Profile Photo + Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Photo */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                                {customer.photo_base64 ? (
                                    <img src={customer.photo_base64} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                        {customer.full_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-forest-dark transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-xl font-bold text-foreground">{customer.full_name}</h2>
                            <p className="text-sm text-muted-foreground">{customer.customer_id}</p>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                                    {customer.gender}
                                </span>
                                {customer.marital_status && (
                                    <span className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">
                                        {customer.marital_status}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChangingPassword(!changingPassword)}
                            className="rounded-xl shrink-0"
                        >
                            <Lock className="w-3.5 h-3.5 mr-1" />
                            Change Password
                        </Button>
                    </div>

                    {/* Change Password Form */}
                    {changingPassword && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-border space-y-3"
                        >
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Minimum 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={saving}
                                    className="forest-gradient text-primary-foreground rounded-xl"
                                    size="sm"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                    Save Password
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setChangingPassword(false); setNewPassword(''); }}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Personal Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField icon={<User className="w-4 h-4" />} label="Full Name" value={customer.full_name} />
                        <InfoField icon={<User className="w-4 h-4" />} label="Gender" value={customer.gender} />
                        <InfoField icon={<Phone className="w-4 h-4" />} label="Mobile" value={`+91 ${customer.mobile}`} />
                        <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={customer.email || 'Not provided'} />
                        <InfoField icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={customer.dob || 'Not provided'} />
                        <InfoField icon={<User className="w-4 h-4" />} label="Marital Status" value={customer.marital_status || 'Not provided'} />
                        {customer.marital_status === 'Married' && customer.marriage_date && (
                            <InfoField icon={<Calendar className="w-4 h-4" />} label="Marriage Date" value={customer.marriage_date} />
                        )}
                    </div>
                </motion.div>

                {/* Address Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Address Information
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(!editing)}
                            className="rounded-xl"
                        >
                            {editing ? (
                                <><X className="w-3.5 h-3.5 mr-1" /> Cancel</>
                            ) : (
                                <><Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Address</>
                            )}
                        </Button>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">State</Label>
                                    <Input value={state} onChange={(e) => setState(e.target.value)} className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">City</Label>
                                    <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-9 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Door No</Label>
                                    <Input value={doorNo} onChange={(e) => setDoorNo(e.target.value)} className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Street</Label>
                                    <Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-9 text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Landmark</Label>
                                <Input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="h-9 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Area</Label>
                                    <Input value={area} onChange={(e) => setArea(e.target.value)} className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Pincode</Label>
                                    <Input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-9 text-sm" maxLength={6} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Alternate Mobile</Label>
                                <Input value={altMobile} onChange={(e) => setAltMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="h-9 text-sm" maxLength={10} />
                            </div>

                            <Button
                                onClick={handleSaveAddress}
                                disabled={saving}
                                className="forest-gradient text-primary-foreground rounded-xl"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                                Save Address
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="Door No" value={customer.address?.door_no || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="Street" value={customer.address?.street || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="Landmark" value={customer.address?.landmark || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="Area" value={customer.address?.area || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="City" value={customer.address?.city || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="State" value={customer.address?.state || 'N/A'} />
                            <InfoField icon={<MapPin className="w-4 h-4" />} label="Pincode" value={customer.address?.pincode || 'N/A'} />
                            <InfoField icon={<Phone className="w-4 h-4" />} label="Alt. Mobile" value={customer.address?.alt_mobile || 'N/A'} />
                        </div>
                    )}
                </motion.div>
            </div>
        </ERPLayout>
    );
};

// Reusable info field component
const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
        <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    </div>
);

export default MyProfile;
