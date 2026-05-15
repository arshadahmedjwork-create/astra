import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, ArrowLeft, RefreshCw, Loader2, Milk, Leaf, Droplets, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { sendOtp, verifyOtp } from '@/lib/msg91';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import astraLogo from '@/assets/astra-logo.png';

type LoginStep = 'login' | 'otp';
/* ── Trust badge ── */
const TrustBadge = ({ icon: Icon, text, delay }: {
    icon: React.ElementType; text: string; delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
    >
        <Icon className="w-4 h-4 text-emerald-300 flex-shrink-0" />
        <span className="text-xs font-bold text-white/90 whitespace-nowrap">{text}</span>
    </motion.div>
);

const Login = () => {
    const [step, setStep] = useState<LoginStep>('login');
    const [identity, setIdentity] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [mobile, setMobile] = useState('');

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

    const handleSendOtp = async () => {
        if (!identity.trim()) {
            toast({ title: 'Enter Identity', description: 'Please enter your mobile number.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const isMobile = /^\d{10}$/.test(identity.trim());
            let targetMobile = identity.trim();

            if (!isMobile) {
                const { data } = await supabase
                    .from('customers')
                    .select('mobile')
                    .eq('customer_id', identity.trim().toUpperCase())
                    .maybeSingle();

                if (!data) {
                    toast({ title: 'User not found', description: 'Could not find a user with this ID.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
                targetMobile = data.mobile;
            } else {
                const { data } = await supabase
                    .from('customers')
                    .select('mobile')
                    .eq('mobile', targetMobile)
                    .maybeSingle();

                if (!data) {
                    toast({ title: 'User not found', description: 'Could not find a user with this mobile number.', variant: 'destructive' });
                    setLoading(false);
                    return;
                }
            }

            setMobile(targetMobile);
            await sendOtp(targetMobile);
            setStep('otp');
            setResendTimer(30);
            toast({ title: 'OTP Sent', description: 'Enter the code sent to your mobile to login.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to send OTP.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return;
        setLoading(true);
        try {
            const isValid = await verifyOtp(mobile, otp);
            if (isValid) {
                const isMobile = /^\d{10}$/.test(identity.trim());
                const customer = isMobile
                    ? await login(identity.trim())
                    : await loginByCustomerId(identity.trim().toUpperCase());

                if (customer) {
                    toast({ title: 'Login successful!', description: `Welcome back, ${customer.full_name}!` });
                    navigate('/erp/dashboard');
                } else {
                    toast({ title: 'Login failed', description: 'Could not complete login.', variant: 'destructive' });
                }
            } else {
                toast({ title: 'Invalid OTP', description: 'The code is incorrect.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Verification failed.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-outfit overflow-hidden">
            {/* ═══════════════════════════════════════════════════
                LEFT — Immersive visual panel
            ═══════════════════════════════════════════════════ */}
            <div className="hidden lg:block lg:w-[52%] relative">
                {/* BG image with slow zoom */}
                <motion.img
                    src="/assets/login-bg-customer.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 28, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                />

                {/* Overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-black/30" />

                {/* Content — vertically spread with flex */}
                <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14 z-10">
                    {/* ── Top: Logo ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Link to="/" className="inline-flex items-center gap-3">
                            <img src={astraLogo} alt="Astra Dairy" className="h-12 w-12 object-contain drop-shadow-xl" />
                            <span className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">
                                Astra<span className="text-emerald-300 italic">Dairy</span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* ── Center: Hero copy ── */}
                    <div className="space-y-5 max-w-sm">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300/90"
                        >
                            Farm to Doorstep
                        </motion.p>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] drop-shadow-lg"
                        >
                            Pure, Fresh
                            <br />
                            <span className="text-emerald-300">&amp; Natural</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.7 }}
                            className="text-sm xl:text-base text-white/70 leading-relaxed font-medium max-w-xs"
                        >
                            Experience the goodness of farm-fresh dairy, delivered
                            straight from our pastures to your doorstep every morning.
                        </motion.p>
                    </div>

                    {/* ── Bottom: Trust badges (single row) ── */}
                    <div className="flex flex-wrap gap-2.5">
                        <TrustBadge icon={Milk} text="100% Pure" delay={1.0} />
                        <TrustBadge icon={Leaf} text="Organic" delay={1.15} />
                        <TrustBadge icon={Droplets} text="Farm Fresh" delay={1.3} />
                        <TrustBadge icon={ShieldCheck} text="FSSAI Certified" delay={1.45} />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                RIGHT — Login form
            ═══════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[48%] min-h-screen flex flex-col justify-center items-center bg-background px-6 sm:px-12 xl:px-16 relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
                        style={{ background: 'radial-gradient(circle, #4aa04a, transparent 70%)' }}
                    />
                </div>

                <div className="w-full max-w-[420px] relative z-10">
                    {/* Mobile-only logo */}
                    <div className="text-center mb-10 lg:hidden">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src={astraLogo} alt="Astra Dairy" className="h-11 w-11 object-contain" />
                            <span className="text-xl font-bold text-primary tracking-tight">
                                Astra<span className="text-accent italic">Dairy</span>
                            </span>
                        </Link>
                    </div>

                    {/* Heading */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1.5">
                            {step === 'login' ? 'Welcome Back' : 'Verification'}
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            {step === 'login' ? 'Sign in to manage your dairy subscriptions' :
                             'Enter the 6-digit code sent to your mobile'}
                        </p>
                    </motion.div>

                    {/* ── Form cards ── */}
                    <AnimatePresence mode="wait">
                        {step === 'login' && (
                            <motion.div
                                key="login-step"
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -18 }}
                                transition={{ duration: 0.3 }}
                                className="bg-card rounded-3xl border border-border p-7 shadow-xl"
                            >
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="identity" className="text-sm font-bold ml-0.5">Mobile Number</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-[18px] h-[18px] transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="identity"
                                                placeholder="Enter your number"
                                                value={identity}
                                                onChange={(e) => setIdentity(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                                className="pl-11 h-[52px] bg-secondary/30 border-none rounded-xl text-base font-semibold focus-visible:ring-primary focus-visible:bg-card transition-all"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSendOtp}
                                        disabled={loading || !identity.trim()}
                                        className="w-full forest-gradient text-primary-foreground rounded-2xl h-[52px] font-black text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 mt-1"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
                                        {!loading && <ArrowRight className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'otp' && (
                            <motion.div
                                key="otp-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-card rounded-3xl border border-border p-7 shadow-xl"
                            >
                                <div className="space-y-7 flex flex-col items-center">
                                    <div className="text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 mb-1.5 block">Identity Recovery</span>
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            Enter the code sent to <span className="text-foreground font-bold">+91 {mobile}</span>
                                        </p>
                                    </div>

                                    <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-2">
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2].map((i) => (
                                                <InputOTPSlot key={i} index={i} className="h-14 w-11 rounded-xl border-none bg-secondary/50 text-xl font-black text-primary focus:ring-2 focus:ring-primary shadow-sm" />
                                            ))}
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup className="gap-2">
                                            {[3, 4, 5].map((i) => (
                                                <InputOTPSlot key={i} index={i} className="h-14 w-11 rounded-xl border-none bg-secondary/50 text-xl font-black text-primary focus:ring-2 focus:ring-primary shadow-sm" />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>

                                    <div className="w-full space-y-3">
                                        <Button
                                            onClick={handleVerifyOtp}
                                            disabled={loading || otp.length !== 6}
                                            className="w-full forest-gradient text-primary-foreground rounded-2xl h-[52px] font-black text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                        </Button>

                                        <div className="flex items-center justify-between px-1 pt-1">
                                            <button onClick={() => setStep('login')} className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                                            </button>
                                            <button onClick={handleSendOtp} disabled={resendTimer > 0 || loading} className={`text-xs font-bold flex items-center gap-1 ${resendTimer > 0 ? 'text-muted-foreground' : 'text-primary'}`}>
                                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                                {resendTimer > 0 ? `${resendTimer}s` : 'Resend'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer links */}
                    {step === 'login' && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center text-sm text-muted-foreground mt-6"
                        >
                            New to Astra Dairy?{' '}
                            <Link to="/erp/register" className="text-primary font-bold hover:underline underline-offset-4">Create Account</Link>
                        </motion.p>
                    )}

                    <p className="mt-8 text-[11px] text-muted-foreground/60 text-center">
                        &copy; {new Date().getFullYear()} Astra Dairy. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
