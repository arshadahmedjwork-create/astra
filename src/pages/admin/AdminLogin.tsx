import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import astraLogo from '@/assets/astra-logo.png';

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
        } catch (error: any) {
            toast({
                title: 'Access Denied',
                description: error.message || 'Invalid admin credentials.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <img src={astraLogo} alt="Astra Dairy" className="w-16 h-16 object-contain mb-4" />
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2 text-foreground">
                        <Shield className="w-6 h-6 text-primary" />
                        Admin Portal
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enter your credentials to manage Astra Dairy operations
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Admin Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@astradairy.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-secondary/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-secondary/50 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full forest-gradient text-primary-foreground font-semibold rounded-xl h-12"
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

            <p className="mt-8 text-xs text-muted-foreground text-center">
                &copy; {new Date().getFullYear()} Astra Dairy. All rights reserved. <br />
                Authorized Personnel Only.
            </p>
        </div>
    );
};

export default AdminLogin;
