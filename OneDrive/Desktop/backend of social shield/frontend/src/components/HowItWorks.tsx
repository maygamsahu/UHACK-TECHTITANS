import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck } from "lucide-react";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Enter Data",
    desc: "Provide a username for auto-scan, or upload a profile dossier manually.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes",
    desc: "Multi-pass audit scans engagement, metadata, and behavioral patterns.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get Trust Score",
    desc: "Receive an itemized forensic report with evidence-backed trust score.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="text-center mb-16"
        >
          <p className="label-forensic mb-3">PROCESS</p>
          <h2 className="text-4xl font-medium tracking-tighter text-foreground">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.1 }}
              className="forensic-card text-center"
            >
              <span className="data-point text-lg mb-4 block">{step.step}</span>
              <step.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
