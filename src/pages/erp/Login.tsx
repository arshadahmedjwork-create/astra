import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Hash, ArrowRight, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { sendOtp, verifyOtp } from '@/lib/msg91';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import astraLogo from '@/assets/astra-logo.png';

type LoginMode = 'mobile' | 'customer_id';
type LoginStep = 'phone' | 'otp';

const Login = () => {
    const [mode, setMode] = useState<LoginMode>('mobile');
    const [step, setStep] = useState<LoginStep>('phone');
    const [mobile, setMobile] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, loginByCustomerId } = useAuthStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

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
            let targetMobile = mobile;

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
                targetMobile = data.mobile;
                setMobile(targetMobile);
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

            // Send actual OTP via our proxy
            await sendOtp(targetMobile);
            
            setStep('otp');
            setResendTimer(30);
            toast({ title: 'OTP Sent', description: `A verification code has been sent to +91 ${targetMobile.slice(0, 2)}******${targetMobile.slice(-2)}` });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to initiate OTP. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) return;

        setLoading(true);
        try {
            const isValid = await verifyOtp(mobile, otp);
            
            if (isValid) {
                const customer = mode === 'customer_id'
                    ? await loginByCustomerId(customerId.toUpperCase())
                    : await login(mobile);

                if (customer) {
                    toast({ title: 'Login successful!', description: `Welcome back, ${customer.full_name}!` });
                    navigate('/erp/dashboard');
                } else {
                    toast({ title: 'Login failed', description: 'Customer data not found.', variant: 'destructive' });
                }
            } else {
                toast({ title: 'Invalid OTP', description: 'The code you entered is incorrect.', variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Verification error', description: error.message || 'Something went wrong.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-outfit">
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
                        <span className="text-2xl font-bold text-primary tracking-tight">
                            Astra<span className="text-accent italic">Dairy</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                        {step === 'phone' ? 'Customer Portal' : 'Verify Identity'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {step === 'phone' ? 'Fresh farm milk, delivered to your door' : 'Enter the 6-digit code sent to your mobile'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'phone' ? (
                        <motion.div
                            key="phone-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/5"
                        >
                            {/* Mode Tabs */}
                            <div className="flex rounded-2xl bg-secondary/50 p-1 mb-8">
                                <button
                                    onClick={() => setMode('mobile')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                        ${mode === 'mobile' ? 'bg-card text-primary shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Phone className="w-4 h-4" />
                                    Mobile
                                </button>
                                <button
                                    onClick={() => setMode('customer_id')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                        ${mode === 'customer_id' ? 'bg-card text-primary shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Hash className="w-4 h-4" />
                                    Account ID
                                </button>
                            </div>

                            <div className="space-y-6">
                                {mode === 'mobile' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile" className="text-sm font-bold ml-1">Registered Mobile</Label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold transition-colors group-focus-within:text-primary">
                                                +91
                                            </span>
                                            <Input
                                                id="mobile"
                                                type="tel"
                                                placeholder="00000 00000"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                className="pl-14 h-14 bg-secondary/30 border-none rounded-2xl text-lg font-bold placeholder:font-normal focus-visible:ring-primary focus-visible:bg-card transition-all"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="customerId" className="text-sm font-bold ml-1">Account Number</Label>
                                        <div className="relative group">
                                            <Input
                                                id="customerId"
                                                placeholder="e.g. AST-XXXXXX"
                                                value={customerId}
                                                onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                                                className="h-14 bg-secondary/30 border-none px-5 rounded-2xl text-lg font-bold placeholder:font-normal focus-visible:ring-primary focus-visible:bg-card transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                        We'll send a high-priority 6-digit security code to your registered mobile number for secure access.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSendOTP}
                                    disabled={loading || (mode === 'mobile' ? mobile.length !== 10 : !customerId)}
                                    className="w-full forest-gradient text-primary-foreground rounded-[1.25rem] h-14 font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP Code'}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
                                <p className="text-sm text-muted-foreground font-medium">
                                    New to Astra Dairy?{' '}
                                    <Link to="/erp/register" className="text-primary font-bold hover:underline underline-offset-4">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/5"
                        >
                            <div className="space-y-8 flex flex-col items-center">
                                <div className="text-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary/60 mb-2 block">Safety Check</span>
                                    <p className="text-sm font-bold text-muted-foreground">
                                        Enter the code sent to <span className="text-foreground">+91 {mobile}</span>
                                    </p>
                                </div>

                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={setOtp}
                                    className="gap-2"
                                >
                                    <InputOTPGroup className="gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <InputOTPSlot 
                                                key={i} 
                                                index={i} 
                                                className="h-16 w-12 rounded-2xl border-none bg-secondary/50 text-2xl font-black text-primary focus:ring-2 focus:ring-primary shadow-sm" 
                                            />
                                        ))}
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup className="gap-2">
                                        {[3, 4, 5].map((i) => (
                                            <InputOTPSlot 
                                                key={i} 
                                                index={i} 
                                                className="h-16 w-12 rounded-2xl border-none bg-secondary/50 text-2xl font-black text-primary focus:ring-2 focus:ring-primary shadow-sm" 
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>

                                <div className="w-full space-y-4">
                                    <Button
                                        onClick={handleVerify}
                                        disabled={loading || otp.length !== 6}
                                        className="w-full forest-gradient text-primary-foreground rounded-[1.25rem] h-14 font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Login'}
                                    </Button>

                                    <div className="flex items-center justify-between px-2">
                                        <button
                                            onClick={() => { setStep('phone'); setOtp(''); }}
                                            className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Update Number
                                        </button>

                                        <button
                                            onClick={handleSendOTP}
                                            disabled={resendTimer > 0 || loading}
                                            className={`text-sm font-bold flex items-center gap-1 transition-colors
                                                ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:text-primary/80'}`}
                                        >
                                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;
