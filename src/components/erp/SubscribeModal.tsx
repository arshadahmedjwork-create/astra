import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, CalendarDays, Minus, Plus, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { format, startOfDay, isBefore } from 'date-fns';
import { generateDatesFromFrequency, toggleDate, calculateSubscriptionTotal, type FrequencyType } from '@/lib/subscriptionUtils';
import { cn } from "@/lib/utils";

interface SubscribeModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
        unit: string;
        category?: string;
        image?: string;
        purchase_type?: 'daily' | 'subscription' | 'both';
    } | null;
    onConfirm: (dates: string[], frequency: FrequencyType, quantity: number) => void;
}

const FREQ_OPTIONS: { key: FrequencyType; label: string; desc: string }[] = [
    { key: 'daily',     label: 'Daily',     desc: 'Every day' },
    { key: 'alternate', label: 'Alt. Days', desc: 'Every 2nd day' },
    { key: 'weekdays',  label: 'Weekdays',  desc: 'Mon–Fri' },
    { key: 'custom',    label: 'Custom',    desc: 'Pick specific dates' },
];

const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose, product, onConfirm }) => {
    const [frequency, setFrequency] = useState<FrequencyType>('daily');
    const [quantity, setQuantity] = useState(1);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined
    });

    const today = startOfDay(new Date());

    // Lock Milk to 1 month or Lock Daily-only to custom
    React.useEffect(() => {
        if (!isOpen || !product) return;

        if (product.category === 'Milk') {
            const end = new Date(today);
            end.setMonth(today.getMonth() + 1);
            setRange({ from: today, to: end });
            setFrequency('daily');
        } else if (product.purchase_type === 'daily') {
            setFrequency('custom');
            setRange({ from: undefined, to: undefined });
        }
    }, [isOpen, product?.id, product?.category, product?.purchase_type]);

    const isDailyOnly = product?.purchase_type === 'daily';

    const generatedDateStrings = useMemo(() => {
        if (!product) return [];
        if (frequency === 'custom') return selectedDates.map(d => format(d, 'yyyy-MM-dd'));
        if (!range.from || !range.to) return [];
        return generateDatesFromFrequency(range.from, range.to, frequency);
    }, [frequency, range, selectedDates, product]);

    const totalCost = product ? calculateSubscriptionTotal(product.price, quantity, generatedDateStrings) : 0;

    const handleConfirm = () => {
        if (!product || generatedDateStrings.length === 0) return;
        onConfirm(generatedDateStrings, frequency, quantity);
        onClose();
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#1B4D3E]">
                        {isDailyOnly ? <CalendarDays className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                        {isDailyOnly ? 'Quick Order' : 'Start Subscription'}
                    </DialogTitle>
                    <DialogDescription>
                        {isDailyOnly 
                            ? `Select a delivery date for ${product.name}`
                            : `Schedule recurring deliveries for ${product.name}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                    {/* Left side: Frequency & Quantity */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {FREQ_OPTIONS.map(opt => (
                                    <Button
                                        key={opt.key}
                                        type="button"
                                        disabled={isDailyOnly && opt.key !== 'custom'}
                                        variant={frequency === opt.key ? "default" : "outline"}
                                        className={cn(
                                            "flex flex-col items-start h-auto p-3 gap-1 transition-all",
                                            frequency === opt.key ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-md scale-[1.02]" : "hover:border-[#1B4D3E]/30",
                                            isDailyOnly && opt.key !== 'custom' && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                        onClick={() => {
                                            if (isDailyOnly && opt.key !== 'custom') return;
                                            setFrequency(opt.key);
                                            setRange({ from: undefined, to: undefined });
                                            setSelectedDates([]);
                                        }}
                                    >
                                        <span className="font-bold">{opt.label}</span>
                                        <span className="text-[10px] opacity-70">{opt.desc}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity per Delivery</Label>
                            <div className="flex items-center gap-4 bg-[#f9fafb] p-2 rounded-xl border border-border w-fit">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-lg hover:bg-white"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <div className="min-w-[60px] text-center">
                                    <div className="text-2xl font-black text-[#1B4D3E]">{quantity}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{product.unit}</div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-lg hover:bg-white"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {generatedDateStrings.length > 0 && (
                            <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Deliveries</span>
                                    <span className="font-bold text-[#1B4D3E]">{generatedDateStrings.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price per {product.unit}</span>
                                    <span className="font-bold text-[#1B4D3E]">₹{product.price}</span>
                                </div>
                                <div className="pt-2 border-t border-[#bbf7d0] flex justify-between items-center">
                                    <span className="font-bold text-[#1B4D3E]">Period Total</span>
                                    <span className="text-2xl font-black text-[#1B4D3E] font-mono">₹{totalCost}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side: Calendar */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {frequency === 'custom' ? 'Select Delivery Dates' : 'Select Date Range'}
                        </Label>
                        <div className="border border-border rounded-2xl p-2 bg-white shadow-sm overflow-hidden">
                            <Calendar
                                mode={frequency === 'custom' ? "multiple" : "range"}
                                selected={frequency === 'custom' ? selectedDates : (range as any)}
                                onSelect={(val: any) => {
                                    if (frequency === 'custom') {
                                        setSelectedDates(val || []);
                                    } else {
                                        setRange(val || { from: undefined, to: undefined });
                                    }
                                }}
                                disabled={(date) => isBefore(date, today) || (product?.category === 'Milk')}
                                className="rounded-xl w-full"
                            />
                        </div>
                        {generatedDateStrings.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-[#16a34a] font-bold px-2 bg-[#f0fdf4] py-2 rounded-lg border border-[#bbf7d0]">
                                <CheckCircle2 className="w-4 h-4" />
                                {generatedDateStrings.length} delivery dates scheduled
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 sm:justify-between items-center pt-4 border-t">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl text-muted-foreground">Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={generatedDateStrings.length === 0}
                        className="bg-[#1B4D3E] hover:bg-[#2c7a65] text-white h-12 px-8 rounded-xl font-bold flex gap-2 shadow-lg transition-all active:scale-95"
                    >
                        {isDailyOnly ? 'Confirm Order' : 'Confirm Subscription'} <ArrowRight className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SubscribeModal;
