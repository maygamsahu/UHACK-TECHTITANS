import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Instagram, Twitter, Linkedin, Facebook, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, active: true, color: "text-primary" },
  { id: "twitter", name: "Twitter", icon: Twitter, active: false, color: "text-muted-foreground" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, active: false, color: "text-muted-foreground" },
  { id: "facebook", name: "Facebook", icon: Facebook, active: false, color: "text-muted-foreground" },
];

const PlatformSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (platform: typeof platforms[0]) => {
    if (platform.active) {
      navigate("/instagram");
    } else {
      toast.info(`${platform.name} analysis is coming soon.`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border">
        <button onClick={() => navigate("/")} className="btn-depress flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <span className="data-point">STEP 1 / 3 — PLATFORM SELECTION</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="text-center mb-12"
        >
          <p className="label-forensic mb-3">SELECT TARGET PLATFORM</p>
          <h1 className="text-4xl font-medium tracking-tighter text-foreground">
            Choose Platform to Audit
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {platforms.map((platform, i) => (
            <motion.button
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.05 }}
              onClick={() => handleSelect(platform)}
              className={`forensic-card relative flex flex-col items-center gap-4 py-10 btn-depress ${
                platform.active
                  ? "border-primary/50 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {!platform.active && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <platform.icon className={`w-10 h-10 ${platform.color}`} />
              <span className="font-display font-semibold text-sm text-foreground">
                {platform.name}
              </span>
              <span className="data-point text-[10px]">
                {platform.active ? "ACTIVE" : "COMING SOON"}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformSelection;
