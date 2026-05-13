import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, Lock, Mail, BarChart3, Users, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import astraLogo from '@/assets/astra-logo.png';

/* ── Stat card for left panel ── */
const StatCard = ({ icon: Icon, label, value, delay }: {
    icon: React.ElementType; label: string; value: string; delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3.5"
    >
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-emerald-300" />
        </div>
        <div className="min-w-0">
            <p className="text-xl font-black text-white leading-none">{value}</p>
            <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider mt-1">{label}</p>
        </div>
    </motion.div>
);

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const login = useAdminAuthStore((state) => state.login);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast({ title: 'Error', description: 'Please enter both email and password', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast({ title: 'Login Successful', description: 'Welcome to Astra Admin Portal' });
            navigate('/admin/dashboard');
        } catch (error) {
            const err = error as Error;
            toast({
                title: 'Access Denied',
                description: err.message || 'Invalid admin credentials.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-outfit overflow-hidden">
            {/* ═══════════════════════════════════════════════════
                LEFT — Dark premium panel
            ═══════════════════════════════════════════════════ */}
            <div className="hidden lg:block lg:w-[52%] relative bg-gray-950">
                {/* BG image — subtle */}
                <motion.img
                    src="/assets/login-bg-admin.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                />

                {/* Dark overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-gray-950/20 to-gray-950/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/20 to-gray-950/45" />

                {/* Glowing accent line on right edge */}
                <motion.div
                    className="absolute right-0 top-0 w-px h-full"
                    style={{ background: 'linear-gradient(180deg, transparent 10%, rgba(74,160,74,0.35) 50%, transparent 90%)' }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Content — evenly distributed */}
                <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14 z-10">
                    {/* ── Top: Brand ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-3"
                    >
                        <img src={astraLogo} alt="Astra Dairy" className="h-12 w-12 object-contain drop-shadow-xl" />
                        <div>
                            <span className="text-xl font-bold text-white tracking-tight block leading-tight">
                                Astra<span className="text-emerald-400 italic">Dairy</span>
                            </span>
                            <span className="text-[10px] font-bold text-white/35 uppercase tracking-[0.2em]">
                                Administration
                            </span>
                        </div>
                    </motion.div>

                    {/* ── Center: Hero copy ── */}
                    <div className="space-y-5 max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Secure Access Only</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15]"
                        >
                            Command
                            <br />
                            <span className="text-emerald-400">Centre</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.7 }}
                            className="text-sm text-white/45 leading-relaxed font-medium max-w-xs"
                        >
                            Manage orders, customers, subscriptions, inventory,
                            and delivery operations from a single dashboard.
                        </motion.p>
                    </div>

                    {/* ── Bottom: Stats grid ── */}
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <StatCard icon={Users} label="Active Customers" value="2,847" delay={1.0} />
                        <StatCard icon={Package} label="Orders Today" value="184" delay={1.15} />
                        <StatCard icon={BarChart3} label="Revenue (MTD)" value="₹12.8L" delay={1.3} />
                        <StatCard icon={TrendingUp} label="Growth Rate" value="+23%" delay={1.45} />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                RIGHT — Admin login form
            ═══════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[48%] min-h-screen flex flex-col justify-center items-center bg-background px-6 sm:px-12 xl:px-16 relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.03]"
                        style={{ background: 'radial-gradient(circle, #4aa04a, transparent 70%)' }}
                    />
                </div>

                <div className="w-full max-w-[420px] relative z-10">
                    {/* Mobile-only logo */}
                    <div className="text-center mb-10 lg:hidden">
                        <img src={astraLogo} alt="Astra Dairy" className="w-14 h-14 object-contain mx-auto mb-3" />
                    </div>

                    {/* Heading */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-1.5">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Shield className="w-[18px] h-[18px] text-primary" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Admin Portal
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium ml-12">
                            Enter your credentials to manage operations
                        </p>
                    </motion.div>

                    {/* Form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="bg-card rounded-3xl border border-border p-7 shadow-xl"
                    >
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-bold ml-0.5">Admin Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-[18px] h-[18px] transition-colors group-focus-within:text-primary" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@astradairy.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-11 h-[52px] bg-secondary/30 border-none rounded-xl text-base font-semibold focus-visible:ring-primary focus-visible:bg-card transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-bold ml-0.5">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-[18px] h-[18px]" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-11 pr-11 h-[52px] bg-secondary/30 border-none rounded-xl text-base font-semibold focus-visible:ring-primary focus-visible:bg-card transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full forest-gradient text-primary-foreground rounded-2xl h-[52px] font-black text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Authenticating...
                                    </>
                                ) : 'Sign In'}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Security notice */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-primary/5 rounded-xl border border-primary/10"
                    >
                        <Shield className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-primary/60 font-medium leading-relaxed">
                            This portal is restricted to authorized Astra Dairy administrators.
                            All access attempts are logged and monitored.
                        </p>
                    </motion.div>

                    <p className="mt-8 text-[11px] text-muted-foreground/60 text-center">
                        &copy; {new Date().getFullYear()} Astra Dairy. All rights reserved.
                        <br />Authorized Personnel Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
