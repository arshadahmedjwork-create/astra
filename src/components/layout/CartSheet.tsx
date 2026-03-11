import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/useCartStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function CartSheet() {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { toast } = useToast();

    const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setIsCheckingOut(true);

        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_CONFORMED;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                // Fallback if env not loaded yet or for demo
                console.warn("EmailJS credentials missing in website checkout");
            }

            const productDetails = items.map(item => `${item.name} (${item.quantity} x ₹${item.price})`).join('\n');

            // Send Email via fetch
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: {
                        to_name: "Customer", // Since we don't have login on main site, or we can ask for name
                        to_email: "Sales Team (Direct Order)",
                        order_total: total,
                        product_details: productDetails,
                        message: "A new order has been placed directly from the website cart."
                    },
                }),
            });

            toast({
                title: "Order Request Sent! 🥛",
                description: "Our team will contact you shortly to confirm delivery.",
            });
            clearCart();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process checkout. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="relative p-2 text-foreground/70 hover:text-primary transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                    {items.length > 0 && (
                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in">
                            {items.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-lg">
                <SheetHeader className="space-y-2.5 pr-6">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Your Cart
                    </SheetTitle>
                </SheetHeader>

                {items.length > 0 ? (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                            <div className="space-y-5">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-sage/20 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
                                                    {item.name}
                                                </h4>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-border rounded-lg overflow-hidden h-8">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-2 hover:bg-secondary transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-2 text-xs font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-2 hover:bg-secondary transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-primary">₹{(item.price || 0) * item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <SheetFooter className="mt-auto border-t border-border pt-6 -mx-6 px-6">
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">Subtotal</span>
                                    <span className="text-xl font-bold text-primary">₹{total}</span>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full h-12 rounded-xl forest-gradient text-primary-foreground font-bold shadow-lg"
                                >
                                    {isCheckingOut ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                    ) : (
                                        <><CreditCard className="w-4 h-4 mr-2" /> Checkout Now</>
                                    )}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                                    Price shown excludes GST/Delivery. Our team will contact you.
                                </p>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground font-medium">Your cart is empty</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
