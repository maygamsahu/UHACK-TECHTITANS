import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { analyzePublic, analyzePrivateManual, analyzePrivateOCR } from "@/lib/api";
import { toast } from "sonner";

const scanMessages = [
  "Initializing audit protocol...",
  "Connecting to data sources...",
  "Analyzing profile metadata...",
  "Scanning engagement patterns...",
  "Checking follower authenticity...",
  "Detecting anomalies in activity...",
  "Cross-referencing behavioral data...",
  "Running sentiment analysis...",
  "Evaluating profile consistency...",
  "Compiling forensic report...",
  "Generating trust score...",
  "Finalizing audit...",
];

const ScanningPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentMsg, setCurrentMsg] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  useEffect(() => {
    const performAnalysis = async () => {
      console.log("Scanning STARTED with state:", location.state);
      try {
        const { mode, ...data } = location.state || {};
        if (!mode) {
          console.warn("No mode specified, navigating back");
          navigate("/instagram");
          return;
        }

        let res;
        if (mode === "auto") {
          console.log("Attempting Public Analysis for:", data.username);
          res = await analyzePublic(data.username);
        } else if (mode === "manual") {
          // Build payload with only available fields
          const formPayload: any = {};

          // Process fields only if they exist and have values
          if (data.username) {
            const uname = data.username.toString().trim();
            const digitCount = (uname.match(/\d/g) || []).length;
            const usernameDigitsRatio = uname.length > 0 ? digitCount / uname.length : 0;
            formPayload.username_digits_ratio = usernameDigitsRatio;
          }

          // Process fullname if provided
          if (data.fullName) {
            const fullName = data.fullName.toString().trim();
            const fullnameWords = fullName.split(/\s+/).filter(Boolean).length;
            formPayload.fullname_words = fullnameWords;
            
            // Only calculate name==username if both are provided
            if (data.username) {
              const uname = data.username.toString().toLowerCase().replace(/@/g, "");
              formPayload.name_equals_username = fullName.toLowerCase().replace(/\s/g, "") === uname ? 1 : 0;
            }
          }

          // Process bio if provided
          if (data.bio) {
            const bioLength = data.bio.toString().length;
            formPayload.bio_length = bioLength;
          }

          // Process posts if provided
          if (data.posts) {
            formPayload.posts = parseInt(data.posts.toString().replace(/,/g, "")) || 0;
          }

          // Process followers if provided
          if (data.followers) {
            formPayload.followers = parseInt(data.followers.toString().replace(/,/g, "")) || 0;
          }

          // Process following if provided
          if (data.following) {
            formPayload.following = parseInt(data.following.toString().replace(/,/g, "")) || 0;
          }

          // Set defaults for always-present fields
          formPayload.profile_pic = data.profilePic ? 1 : 0;
          formPayload.external_url = 0;
          formPayload.is_private = 1;

          // Only include calculated defaults if not explicitly provided
          if (!formPayload.username_digits_ratio) formPayload.username_digits_ratio = 0.0;
          if (!formPayload.fullname_words) formPayload.fullname_words = 0;
          if (!formPayload.fullname_digits_ratio) formPayload.fullname_digits_ratio = 0.0;
          if (!formPayload.name_equals_username) formPayload.name_equals_username = 0;
          if (!formPayload.bio_length) formPayload.bio_length = 0;
          if (!formPayload.posts) formPayload.posts = 0;
          if (!formPayload.followers) formPayload.followers = 0;
          if (!formPayload.following) formPayload.following = 0;

          if (data.screenshot) {
            console.log("Attempting OCR Analysis with payload:", formPayload);
            res = await analyzePrivateOCR([data.screenshot], formPayload);
          } else {
            console.log("Attempting Private Manual Analysis with payload:", formPayload);
            res = await analyzePrivateManual(formPayload);
          }
        }

        console.log("SUCCESS: Received analysis result:", res);
        setResult(res);
      } catch (error: any) {
        console.error("ANALYSIS FAILED:", error);
        toast.error(error.message || "Analysis failed");
        navigate("/instagram");
      }
    };

    performAnalysis();
  }, [location.state, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) {
          if (result) {
            console.log("Progress complete, navigating to results");
            clearInterval(interval);
            setTimeout(() => navigate("/results", { state: { result } }), 300);
            return 100;
          }
          return 99;
        }
        return p + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigate, result]);

  useEffect(() => {
    const msgIndex = Math.min(
      Math.floor((progress / 100) * scanMessages.length),
      scanMessages.length - 1
    );
    if (msgIndex !== currentMsg) {
      setCurrentMsg(msgIndex);
      setLogs((prev) => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${scanMessages[msgIndex]}`]);
    }
  }, [progress, currentMsg]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Shield className="w-16 h-16 text-primary" />
            <div className="absolute inset-0 w-16 h-16 border border-primary rounded-sm animate-pulse-border" />
          </div>
          <p className="label-forensic mb-2">AUDIT IN PROGRESS</p>
          <h1 className="text-3xl font-medium tracking-tighter text-foreground">
            Analyzing Target
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="data-point">{scanMessages[currentMsg]}</span>
            <span className="data-point">{progress}%</span>
          </div>
          <div className="h-1 bg-secondary rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Live log terminal */}
        <div className="forensic-card bg-background/50 font-mono text-xs max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="py-1 text-muted-foreground"
            >
              <span className="text-primary mr-2">›</span>
              {log}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ScanningPage;
