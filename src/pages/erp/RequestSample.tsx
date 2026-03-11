import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, CheckCircle2, Milk } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ERPLayout from '@/components/erp/ERPLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const RequestSample = () => {
    const { customer } = useAuthStore();
    const { toast } = useToast();
    const [alreadyRequested, setAlreadyRequested] = useState(false);
    const [sampleStatus, setSampleStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!customer?.id) return;

        const checkSample = async () => {
            const { data } = await supabase
                .from('sample_requests')
                .select('*')
                .eq('customer_id', customer.id)
                .single();

            if (data) {
                setAlreadyRequested(true);
                setSampleStatus(data.status);
            }
            setLoading(false);
        };
        checkSample();
    }, [customer?.id]);

    const handleRequest = async () => {
        if (!customer?.id) return;
        setSubmitting(true);

        const { data: cowMilk } = await supabase
            .from('products')
            .select('*') // Get full data including price/name
            .eq('name', 'Cow Milk')
            .eq('is_sample', true)
            .single();

        if (!cowMilk) {
            toast({ title: 'Error', description: 'Sample product not found.', variant: 'destructive' });
            setSubmitting(false);
            return;
        }

        const { error } = await supabase.from('sample_requests').insert({
            customer_id: customer.id,
            product_id: cowMilk.id,
        });

        if (error) {
            if (error.code === '23505') {
                toast({ title: 'Already requested', description: 'You have already requested a sample.', variant: 'destructive' });
                setAlreadyRequested(true);
            } else {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        } else {
            // Send Confirmation Email
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_CONFORMED;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (serviceId && templateId && publicKey) {
                fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: serviceId,
                        template_id: templateId,
                        user_id: publicKey,
                        template_params: {
                            to_name: customer?.full_name,
                            to_email: customer?.email,
                            order_id: 'SAMPLE-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                            order_total: 100,
                            product_details: `1x ${cowMilk.name} (Trial Sample)`,
                            message: "Your trial sample request has been received. Our team will contact you to schedule delivery."
                        },
                    }),
                }).catch(e => console.error('Sample email failed:', e));
            }

            setAlreadyRequested(true);
            setSampleStatus('requested');
            toast({ title: 'Sample Requested! 🎉', description: 'Your cow milk sample will be delivered soon.' });
        }
        setSubmitting(false);
    };

    return (
        <ERPLayout>
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                        <FlaskConical className="w-7 h-7 text-primary" />
                        Request Sample
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try our farm-fresh cow milk before subscribing
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex items-start gap-5">
                                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-sage/30 flex items-center justify-center shrink-0">
                                    <Milk className="w-10 h-10 md:w-14 md:h-14 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Cow Milk Sample</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Farm fresh A2 cow's milk in glass bottle. Delivered within 12 hours of milking.
                                    </p>

                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary">₹100</span>
                                        <span className="text-sm text-muted-foreground">one-time trial</span>
                                    </div>

                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                            ⚡ One sample per customer
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                {alreadyRequested ? (
                                    <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 rounded-xl p-4">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm">Sample Already Requested</p>
                                            <p className="text-xs mt-0.5">
                                                Status: <span className="font-medium capitalize">{sampleStatus}</span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                className="w-full forest-gradient text-primary-foreground rounded-xl h-12 font-semibold text-base"
                                                disabled={submitting}
                                            >
                                                {submitting ? 'Processing...' : 'Request Sample — ₹100'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Sample Request</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    You're about to request a Cow Milk sample for ₹100. This is a one-time offer.
                                                    Our delivery partner will contact you to schedule delivery.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleRequest}
                                                    className="forest-gradient text-primary-foreground"
                                                >
                                                    Confirm Request
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ERPLayout>
    );
};

export default RequestSample;
