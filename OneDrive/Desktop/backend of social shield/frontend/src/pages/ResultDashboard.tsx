import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle,
  Activity, Users, Eye, BarChart3, FileText
} from "lucide-react";
import { AnalysisResult } from "@/lib/api";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

const tabs = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "activity", label: "Activity Analysis", icon: Activity },
  { id: "profile", label: "Profile Authenticity", icon: Users },
  { id: "network", label: "Network Behavior", icon: BarChart3 },
];

const ResultDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const backendResult = location.state?.result as AnalysisResult;

  // Map backend result to frontend structure
  const r = backendResult ? {
    username: backendResult.account_data.username || "Anonymous Target",
    trustScore: Math.round(backendResult.trust_score),
    reportId: `SS-${Math.floor(Math.random() * 10000)}-X`,
    timestamp: new Date().toISOString(),
    confidence: Math.round(backendResult.confidence),
    verdict: backendResult.prediction === "GENUINE" ? "Safe" : "Suspicious" as const,
    breakdown: {
      profileAuthenticity: Math.round(backendResult.trust_score),
      engagementQuality: Math.round(Math.max(0, Math.min(100, 100 - (backendResult.ffr_ratio * 10)))),
      networkBehavior: backendResult.trust_score > 50 ? 70 : 30,
      contentConsistency: 50,
    },
    signals: backendResult.risk_factors.map((factor: string) => ({
      type: backendResult.prediction === "GENUINE" ? "safe" : "risk" as const,
      label: factor,
      desc: backendResult.explanation
    })),
    suggestions: [
      backendResult.prediction === "FAKE" ? "Avoid direct business transactions with this account." : "This account appears trustworthy. Monitor for future anomalies.",
      "Cross-reference with other social platforms.",
      "Report if fraudulent activity is confirmed."
    ],
  } : null;

  if (!r) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="label-forensic mb-4">NO DATA FOUND</p>
          <button onClick={() => navigate("/instagram")} className="btn-depress text-primary">
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  const scoreColor =
    r.trustScore >= 70 ? "text-evidence-high" :
      r.trustScore >= 40 ? "text-evidence-warning" :
        "text-evidence-low";

  const scoreBg =
    r.trustScore >= 70 ? "bg-evidence-high" :
      r.trustScore >= 40 ? "bg-evidence-warning" :
        "bg-evidence-low";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border">
        <button onClick={() => navigate("/instagram")} className="btn-depress flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">New Audit</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="data-point">REPORT: {r.reportId}</span>
          <span className="data-point">{r.timestamp.slice(0, 10)}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Trust Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="forensic-card mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score gauge */}
            <div className="flex flex-col items-center gap-3">
              <p className="label-forensic">TRUST SCORE</p>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={r.trustScore >= 70 ? "hsl(var(--evidence-high))" : r.trustScore >= 40 ? "hsl(var(--evidence-warning))" : "hsl(var(--evidence-low))"}
                    strokeWidth="6"
                    strokeDasharray={`${(r.trustScore / 100) * 327} 327`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute text-3xl font-mono font-bold ${scoreColor}`}>
                  {r.trustScore}
                </span>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-widest ${scoreColor}`}>
                {r.verdict}
              </span>
            </div>

            {/* Confidence meter */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(r.breakdown).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="label-forensic mb-1">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</p>
                    <p className={`text-2xl font-mono font-bold ${val >= 50 ? "text-evidence-high" : "text-evidence-low"}`}>
                      {val}%
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <p className="label-forensic flex-shrink-0">CONFIDENCE</p>
                <div className="flex-1 h-1 bg-secondary rounded-sm overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${r.confidence}%` }} />
                </div>
                <span className="data-point">{r.confidence}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-depress flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-colors border-b-2 ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signals */}
          <div className="lg:col-span-2 space-y-3">
            <p className="label-forensic mb-2">DETECTED SIGNALS</p>
            {r.signals.map((signal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="forensic-card flex items-start gap-4"
              >
                {signal.type === "risk" && <XCircle className="w-5 h-5 text-evidence-low flex-shrink-0 mt-0.5" />}
                {signal.type === "warning" && <AlertTriangle className="w-5 h-5 text-evidence-warning flex-shrink-0 mt-0.5" />}
                {signal.type === "safe" && <CheckCircle2 className="w-5 h-5 text-evidence-high flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{signal.label}</p>
                  <p className="text-xs text-muted-foreground">{signal.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggestions */}
            <div className="forensic-card">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <p className="label-forensic">RECOMMENDED ACTIONS</p>
              </div>
              <ul className="space-y-3">
                {r.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">›</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Report meta */}
            <div className="forensic-card">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <p className="label-forensic">REPORT DETAILS</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Report ID</span>
                  <span className="data-point">{r.reportId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Timestamp</span>
                  <span className="data-point">{r.timestamp.slice(0, 19)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="data-point">{r.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Target</span>
                  <span className="data-point">{r.username}</span>
                </div>
              </div>
            </div>

            {/* Risk tags */}
            <div className="forensic-card">
              <p className="label-forensic mb-3">RISK TAGS</p>
              <div className="flex flex-wrap gap-2">
                {["Suspicious", "Fake Engagement", "Bot Pattern"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border border-evidence-low/30 text-evidence-low rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
