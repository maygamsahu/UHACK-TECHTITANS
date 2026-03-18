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
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
          <source src={heroBg} />
        </video>

        {/* Overlay with transparency */}
        <div className="absolute inset-0 bg-background/40" />

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
      <Footer />
    </div>
  );
};

export default Landing;
