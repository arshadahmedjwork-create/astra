import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  generateDatesFromFrequency,
  toggleDate,
  calculateSubscriptionTotal,
  type FrequencyType,
} from '@/lib/subscriptionUtils';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  format, addMonths, subMonths, isBefore, startOfDay,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Minus, Plus,
  CalendarDays, Repeat, CheckCircle2, Loader2,
} from 'lucide-react';

// ─── Frequency options ────────────────────────────────────────────────────────
const FREQ_OPTIONS: { key: FrequencyType; label: string; desc: string }[] = [
  { key: 'daily',     label: 'Daily',     desc: 'Every day' },
  { key: 'alternate', label: 'Alt. Days', desc: 'Every 2nd day' },
  { key: 'weekdays',  label: 'Weekdays',  desc: 'Mon – Fri' },
  { key: 'custom',    label: 'Custom',    desc: 'Pick dates' },
];

// ─── Mini Calendar (custom date picker) ──────────────────────────────────────
function MiniCalendar({
  selectedDates,
  onToggle,
}: {
  selectedDates: string[];
  onToggle: (date: string) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(viewDate);
  const monthEnd   = endOfMonth(viewDate);
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow    = getDay(monthStart);
  const dayHeaders  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-foreground">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayHeaders.map((h) => (
          <div
            key={h}
            className="text-center text-[10px] font-bold text-muted-foreground py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startDow).fill(null).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr    = format(day, 'yyyy-MM-dd');
          const isPast     = isBefore(startOfDay(day), today);
          const isSelected = selectedDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => onToggle(dateStr)}
              className={`
                w-full aspect-square rounded-lg text-xs font-semibold transition-all
                ${isPast
                  ? 'text-muted-foreground/25 cursor-not-allowed'
                  : isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/25 scale-110'
                    : 'hover:bg-primary/10 text-foreground'
                }
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <p className="text-center text-xs text-primary font-bold mt-3">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

// ─── SubscribeModal ───────────────────────────────────────────────────────────

export interface SubscribeModalProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  product: SubscribeModalProduct | null;
  onSuccess?: () => void;
}

export default function SubscribeModal({
  open,
  onClose,
  product,
  onSuccess,
}: SubscribeModalProps) {
  const { customer } = useAuthStore();
  const [frequency, setFrequency]   = useState<FrequencyType>('daily');
  const [startDate, setStartDate]   = useState('');
  const [endDate,   setEndDate]     = useState('');
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [quantity, setQuantity]     = useState(1);
  const [loading,  setLoading]      = useState(false);
  const [success,  setSuccess]      = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Compute dates array reactively
  const selectedDates = useMemo((): string[] => {
    if (!product) return [];
    if (frequency === 'custom') return customDates;
    if (!startDate || !endDate || endDate < startDate) return [];
    return generateDatesFromFrequency(
      new Date(startDate + 'T00:00:00'),
      new Date(endDate   + 'T00:00:00'),
      frequency,
    );
  }, [frequency, startDate, endDate, customDates, product]);

  const total = product
    ? calculateSubscriptionTotal(product.price, quantity, selectedDates)
    : 0;

  const handleToggleCustomDate = (date: string) => {
    setCustomDates((prev) => toggleDate(prev, date));
  };

  const resetState = () => {
    setFrequency('daily');
    setStartDate('');
    setEndDate('');
    setCustomDates([]);
    setQuantity(1);
    setSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubscribe = async () => {
    if (!customer?.id) {
      toast.error('Please log in first.');
      return;
    }
    if (!product) return;
    if (selectedDates.length === 0) {
      toast.error('Select at least one delivery date.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('subscriptions').insert({
        customer_id:    customer.id,
        product_id:     product.id,
        frequency_type: frequency,
        selected_dates: selectedDates,
        start_date:     selectedDates[0],
        end_date:       selectedDates[selectedDates.length - 1],
        required_date:  selectedDates[0],
        unit_price:     product.price,
        quantity,
        status:         'active',
      });

      if (error) throw error;

      setSuccess(true);
      onSuccess?.();
      toast.success(
        `Subscribed! ${selectedDates.length} deliveries scheduled for ${product.name}. 🎉`,
      );

      setTimeout(() => {
        handleClose();
      }, 1600);
    } catch (e: any) {
      toast.error('Subscription failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm rounded-[28px] overflow-y-auto max-h-[92vh] p-0 gap-0 border-border shadow-2xl">
        {success ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">Subscribed!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {selectedDates.length} deliveries scheduled for <strong>{product.name}</strong>.
              Amount will be auto-deducted from your wallet on each delivery day.
            </p>
          </div>
        ) : (
          <>
            {/* Green header */}
            <div className="forest-gradient p-6 rounded-t-[28px]">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Repeat className="w-4 h-4 text-white" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">
                  Pre-Order / Subscribe
                </span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{product.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">
                ₹{product.price} / {product.unit}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Frequency Selector */}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 block">
                  Delivery Frequency
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {FREQ_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setFrequency(opt.key)}
                      className={`
                        flex flex-col items-center py-3 px-1 rounded-2xl border transition-all
                        ${frequency === opt.key
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-card border-border hover:border-primary/40 text-foreground'
                        }
                      `}
                    >
                      <span className="text-[11px] font-black">{opt.label}</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          frequency === opt.key ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {frequency === 'custom' ? (
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 block">
                    Tap Dates to Select
                  </label>
                  <div className="bg-secondary/30 rounded-2xl border border-border p-4">
                    <MiniCalendar
                      selectedDates={customDates}
                      onToggle={handleToggleCustomDate}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 block">
                    Delivery Period
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold mb-1">Start</p>
                      <input
                        type="date"
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold mb-1">End</p>
                      <input
                        type="date"
                        min={startDate || today}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  {selectedDates.length > 0 && (
                    <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {selectedDates.length} delivery dates selected
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 block">
                  Quantity per Delivery
                </label>
                <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl border border-border p-3 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center min-w-[44px]">
                    <p className="text-2xl font-black text-foreground leading-none">{quantity}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">
                      {product.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cost Summary */}
              {selectedDates.length > 0 && (
                <div className="bg-primary/5 rounded-2xl border border-primary/15 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Per delivery</span>
                    <span className="font-bold text-foreground">
                      ₹{product.price} × {quantity} = ₹{(product.price * quantity).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deliveries</span>
                    <span className="font-bold text-foreground">{selectedDates.length}</span>
                  </div>
                  <div className="h-px bg-primary/15" />
                  <div className="flex justify-between items-center">
                    <span className="font-black text-foreground">Period Total</span>
                    <span className="font-black text-primary text-xl">₹{total.toFixed(0)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    *Deducted from wallet daily on each delivery date
                  </p>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={handleSubscribe}
                disabled={loading || selectedDates.length === 0}
                className="w-full h-14 rounded-2xl font-black text-base forest-gradient shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Subscribing...</>
                ) : selectedDates.length === 0 ? (
                  'Select dates to continue'
                ) : (
                  `Subscribe Now · ₹${total.toFixed(0)}`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
