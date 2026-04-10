import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { initMsg91Widget } from '@/lib/msg91';
import astraLogo from '@/assets/astra-logo.png';

type LoginMode = 'mobile' | 'customer_id';

const Login = () => {
    const [mode, setMode] = useState<LoginMode>('mobile');
    const [mobile, setMobile] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, loginByCustomerId } = useAuthStore();

    const handleSendOTP = async () => {
        if (mode === 'mobile' && mobile.length !== 10) {
            toast({ title: 'Invalid mobile number', description: 'Please enter a valid 10-digit mobile number.', variant: 'destructive' });
            return;
        }
        if (mode === 'customer_id' && !customerId.trim()) {
            toast({ title: 'Invalid Customer ID', description: 'Please enter your customer ID.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            let customerMobile = mobile;

            if (mode === 'customer_id') {
                const { data } = await supabase
                    .from('customers')
                    .select('mobile')
                    .eq('customer_id', customerId.toUpperCase())
                    .single();

                if (!data) {
                    toast({ title: 'Customer ID not found', description: 'Please check your customer ID and try again.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                customerMobile = data.mobile;
                setMobile(customerMobile);
            } else {
                const { data } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('mobile', mobile)
                    .single();

                if (!data) {
                    toast({ title: 'Mobile number not registered', description: 'Please register first or check your number.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
            }

            setLoading(false);

            // Open the MSG91 OTP Widget — it handles send + verify UI entirely.
            // On success the widget calls our callback with a verified JWT token.
            initMsg91Widget(
                customerMobile,
                async (_data) => {
                    setLoading(true);
                    try {
                        const customer = mode === 'customer_id'
                            ? await loginByCustomerId(customerId.toUpperCase())
                            : await login(customerMobile);

                        if (customer) {
                            toast({ title: 'Login successful!', description: `Welcome back, ${customer.full_name}!` });
                            navigate('/erp/dashboard');
                        } else {
                            toast({ title: 'Login failed', description: 'Customer not found.', variant: 'destructive' });
                        }
                    } catch {
                        toast({ title: 'Login error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('MSG91 OTP failure:', error);
                    toast({ title: 'OTP failed', description: 'Could not verify OTP. Please try again.', variant: 'destructive' });
                    setLoading(false);
                }
            );
        } catch {
            toast({ title: 'Error', description: 'Failed to initiate OTP. Please try again.', variant: 'destructive' });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <img src={astraLogo} alt="Astra Dairy" className="h-12 w-12 object-contain" />
                        <span className="text-2xl font-bold text-primary">
                            Astra<span className="text-accent">Dairy</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to your customer portal</p>
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
                    {/* Mode Tabs */}
                    <div className="flex rounded-xl bg-secondary/50 p-1 mb-6">
                        <button
                            onClick={() => setMode('mobile')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${mode === 'mobile' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Phone className="w-4 h-4" />
                            Mobile
                        </button>
                        <button
                            onClick={() => setMode('customer_id')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${mode === 'customer_id' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Hash className="w-4 h-4" />
                            Customer ID
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mode === 'mobile' ? (
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="pl-12"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="customerId">Customer ID</Label>
                                <Input
                                    id="customerId"
                                    placeholder="e.g. ASN-000001"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                                />
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            An OTP will be sent to your registered mobile number to verify your identity.
                        </p>

                        <Button
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="w-full forest-gradient text-primary-foreground rounded-xl h-11 font-semibold"
                        >
                            {loading ? 'Verifying...' : 'Send OTP'}
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/erp/register" className="text-primary font-semibold hover:underline">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
