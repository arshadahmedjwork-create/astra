import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { companyInfo } from "@/constants/astraData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'unread'
        }]);

      if (error) throw error;

      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible."
      });
      
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-eyebrow text-accent mb-3">Get In Touch</p>
              <h1 className="text-section-title text-forest mb-4">Contact Us</h1>
              <p className="text-lead text-charcoal/80">
                Have questions about our farm-fresh products or your subscription? We're here to help. Reach out to us using the form below or through our contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12">
              {/* Contact Information */}
              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Farm & Office Address", text: companyInfo.address },
                  { icon: Phone, title: "Phone", text: `${companyInfo.phone1}${companyInfo.phone2 ? ` / ${companyInfo.phone2}` : ""}` },
                  { icon: Mail, title: "Email", text: companyInfo.email },
                  { icon: Clock, title: "Support Hours", text: "Mon–Sat: 8:00 AM – 8:00 PM\nSunday: 8:00 AM – 12:00 PM" },
                ].map((item, index) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border/50 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:shadow-md hover:border-border transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl forest-gradient flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>



              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-3xl p-8 shadow-xl"
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        className="h-12 bg-muted/50" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        className="h-12 bg-muted/50" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      className="h-12 bg-muted/50" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help you?" 
                      className="h-12 bg-muted/50" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">Message *</label>
                    <Textarea 
                      id="message" 
                      placeholder="Write your message here..." 
                      className="min-h-[150px] bg-muted/50 resize-y" 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full h-12 text-lg gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
