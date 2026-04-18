import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
  const lastUpdated = "April 18, 2026";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Header Section */}
            <div className="text-center space-y-4">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                Compliance & Security
              </span>
              <h1 className="text-5xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground font-medium">Last Updated: {lastUpdated}</p>
            </div>

            <div className="bg-card p-8 md:p-12 rounded-[32px] border border-border shadow-sm space-y-10">
              {/* 1. Introduction */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Astra Dairy. We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or use our mobile application.
                </p>
              </section>

              {/* 2. Information Collection */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide our farm-to-table delivery services, we collect several types of information:
                </p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
                  <li><span className="font-semibold text-foreground">Account Information:</span> Name, phone number, email address, and delivery address.</li>
                  <li><span className="font-semibold text-foreground">Identification:</span> KYC details if required for specific subscription plans.</li>
                  <li><span className="font-semibold text-foreground">Transaction Data:</span> Details about product orders and billing information.</li>
                  <li><span className="font-semibold text-foreground">Device Data:</span> IP address, browser type, and operating system for app stability.</li>
                </ul>
              </section>

              {/* 3. Purpose of Collection */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use your information for the following purposes:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Processing and delivering your orders.",
                    "Sending OTPs and order updates via SMS (MSG91).",
                    "Managing your subscription and monthly billing.",
                    "Providing customer support and issue resolution.",
                    "Improving app performance and security."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Third-Party Services */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We do not sell your data. However, we use trusted third-party providers to ensure reliable service:
                </p>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                    <h3 className="font-bold text-foreground mb-1">Supabase</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Database & Authentication</p>
                    <p className="text-sm text-muted-foreground">Your records are securely stored on Supabase servers using industry-standard encryption protocols.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                    <h3 className="font-bold text-foreground mb-1">MSG91</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Communication Proxy</p>
                    <p className="text-sm text-muted-foreground">We share your phone number with MSG91 solely for the purpose of sending transactional SMS and OTPs for account security.</p>
                  </div>
                </div>
              </section>

              {/* 5. Your Rights */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Depending on your location, you have rights regarding your personal data:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Right to Access", "Right to Correction", "Right to Deletion (Right to be Forgotten)", "Right to Withdraw Consent"].map((right) => (
                    <span key={right} className="px-3 py-1 bg-background border border-border rounded-lg text-xs font-semibold text-foreground">
                      {right}
                    </span>
                  ))}
                </div>
              </section>

              {/* 6. Contact & Support */}
              <section className="pt-8 border-t border-border">
                <div className="bg-primary/5 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Need clarification?</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Our privacy officer is available to answer any questions regarding your data and rights.
                    </p>
                  </div>
                  <a 
                    href="mailto:hello@astradairy.in"
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Contact Support
                  </a>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

