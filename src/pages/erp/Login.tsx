import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Hash, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import astraLogo from '@/assets/astra-logo.png';

type LoginMode = 'mobile' | 'customer_id';
type LoginStep = 'input' | 'otp';

const Login = () => {
    const [mode, setMode] = useState<LoginMode>('mobile');
    const [step, setStep] = useState<LoginStep>('input');
    const [mobile, setMobile] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [timer, setTimer] = useState(300);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, loginByCustomerId } = useAuthStore();

    const startTimer = () => {
        setShowTimer(true);
        setTimer(300);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setShowTimer(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

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
            // In production, this would send a real OTP via Supabase phone auth
            // For demo, we're simulating OTP verification
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

            // Store OTP record (demo: OTP = 123456)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            await supabase.from('otp_verification').insert({
                mobile: customerMobile,
                otp_hash: '123456', // In production: hash the real OTP
                expires_at: expiresAt,
                attempts: 0,
                verified: false,
            });

            setStep('otp');
            startTimer();
            toast({ title: 'OTP Sent!', description: `OTP sent to ******${customerMobile.slice(-4)}. For demo use: 123456` });
        } catch {
            toast({ title: 'Error', description: 'Failed to send OTP. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data: otpRecord } = await supabase
                .from('otp_verification')
                .select('*')
                .eq('mobile', mobile)
                .eq('verified', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!otpRecord) {
                toast({ title: 'OTP expired', description: 'Please request a new OTP.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            if (otpRecord.attempts >= 3) {
                toast({ title: 'Max attempts reached', description: 'Too many attempts. Please request a new OTP.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            if (new Date(otpRecord.expires_at) < new Date()) {
                toast({ title: 'OTP expired', description: 'OTP has expired. Please request a new one.', variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Update attempts
            await supabase
                .from('otp_verification')
                .update({ attempts: otpRecord.attempts + 1 })
                .eq('id', otpRecord.id);

            if (otpRecord.otp_hash !== otp) {
                toast({ title: 'Invalid OTP', description: `Incorrect OTP. ${2 - otpRecord.attempts} attempts remaining.`, variant: 'destructive' });
                setLoading(false);
                return;
            }

            // Mark verified
            await supabase
                .from('otp_verification')
                .update({ verified: true })
                .eq('id', otpRecord.id);

            // Login the customer
            const customer = mode === 'customer_id'
                ? await loginByCustomerId(customerId.toUpperCase())
                : await login(mobile);

            if (customer) {
                toast({ title: 'Login successful!', description: `Welcome back, ${customer.full_name}!` });
                navigate('/erp/dashboard');
            } else {
                toast({ title: 'Login failed', description: 'Customer not found.', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Verification failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
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
                    {step === 'input' && (
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
                    )}

                    {step === 'input' ? (
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

                            <Button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full forest-gradient text-primary-foreground rounded-xl h-11 font-semibold"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Enter the 6-digit code sent to
                                </p>
                                <p className="text-sm font-semibold text-foreground mt-1">
                                    +91 ******{mobile.slice(-4)}
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            {showTimer && (
                                <p className="text-center text-xs text-muted-foreground">
                                    OTP expires in <span className="font-semibold text-accent">{formatTimer(timer)}</span>
                                </p>
                            )}

                            <Button
                                onClick={handleVerifyOTP}
                                disabled={loading || otp.length !== 6}
                                className="w-full forest-gradient text-primary-foreground rounded-xl h-11 font-semibold"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </Button>

                            <button
                                onClick={() => { setStep('input'); setOtp(''); }}
                                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                ← Change login method
                            </button>
                        </div>
                    )}

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
