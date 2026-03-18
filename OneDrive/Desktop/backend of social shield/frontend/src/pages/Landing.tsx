import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video - Top Left Corner */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-20 left-8 w-96 h-64 object-cover rounded-lg shadow-2xl border-2 border-primary/30 z-5"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
        </video>

        {/* Background Video Full Screen */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
          <source src={heroBg} />
        </video>

        {/* Overlay with transparency */}
        <div className="absolute inset-0 bg-background/50" />

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-semibold text-foreground tracking-tight">
              SOCIAL SHIELD
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="data-point">v1.0.0</span>
            <span className="data-point">STATUS: ONLINE</span>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p className="label-forensic mb-6">DIGITAL IDENTITY VERIFICATION SYSTEM</p>
            <h1 className="text-7xl font-medium tracking-tighter text-balance text-foreground leading-none mb-6">
              Social Shield
            </h1>
            <p className="text-2xl font-light text-muted-foreground tracking-tight mb-2">
              Analyze. Verify. Protect.
            </p>
            <p className="data-point mt-4 mb-12">
              SYSTEM ID: SS-2026-X &nbsp;|&nbsp; CONFIDENCE ENGINE: ACTIVE
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.5 }}
            onClick={() => navigate("/platform")}
            className="btn-depress inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3 rounded-sm font-semibold text-sm uppercase tracking-widest border border-primary hover:bg-primary/90"
          >
            Begin Audit
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Bottom scan line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-primary/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />
      </section>

      <HowItWorks />
      
      {/* About Section */}
      <section className="relative py-24 px-8 bg-gradient-to-b from-background to-muted overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={spring}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-foreground mb-4">About Social Shield</h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            {/* Left - About Text */}
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Social Shield is a smart platform designed to detect and prevent fake accounts across social media. Our mission is to create a safer digital environment by identifying suspicious behavior, analyzing account authenticity, and protecting users from scams, impersonation, and misinformation.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Using advanced technology and data-driven insights, Social Shield helps individuals and organizations verify profiles, build trust, and stay secure online.
              </p>

              <div className="pt-6">
                <button
                  onClick={() => navigate("/platform")}
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3 rounded-sm font-semibold text-sm uppercase tracking-widest border border-primary hover:bg-primary/90 transition-colors"
                >
                  Start Verification
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right - Features Grid */}
            <div className="grid grid-cols-1 gap-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Detect Fake Accounts</h3>
                <p className="text-sm text-muted-foreground">Advanced algorithms identify suspicious patterns and fake profiles</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Verify Authenticity</h3>
                <p className="text-sm text-muted-foreground">Comprehensive analysis of account metrics and behavior patterns</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.5 }}
                viewport={{ once: true }}
                className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Stay Secure</h3>
                <p className="text-sm text-muted-foreground">Protect yourself from scams, impersonation, and misinformation</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Landing;
