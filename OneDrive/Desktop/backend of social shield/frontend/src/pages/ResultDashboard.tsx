import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle,
  Activity, Users, Eye, BarChart3, FileText, Send, Loader, Download
} from "lucide-react";
import { AnalysisResult } from "@/lib/api";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

// Report criteria for analysis
const reportCriteria = [
  {
    name: "Profile Picture Quality",
    description: "Analysis of profile picture authenticity and clarity",
    icon: Users
  },
  {
    name: "Username Pattern Analysis",
    description: "Detection of suspicious characters, numbers, and naming patterns",
    icon: Activity
  },
  {
    name: "Engagement Metrics",
    description: "Posts, followers, and following count consistency analysis",
    icon: BarChart3
  },
  {
    name: "Account Activity",
    description: "Pattern recognition for bot-like behavior and posting frequency",
    icon: Eye
  },
  {
    name: "Bio & Description",
    description: "Content analysis for suspicious URLs, claims, or impersonation signs",
    icon: FileText
  },
  {
    name: "Follower-Following Ratio",
    description: "FFR calculation to detect fake followers and engagement manipulation",
    icon: Activity
  },
];

const ResultDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI analysis assistant. Ask me anything about this profile's authenticity, risk factors, or any specific concerns you have."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate AI response based on profile data
  const generateAIResponse = (userMessage: string): string => {
    const messageLower = userMessage.toLowerCase();

    // Questions about verdict
    if (messageLower.includes("fake") || messageLower.includes("genuine") || messageLower.includes("real")) {
      return r?.verdict === "Safe" 
        ? "This account appears to be genuine. All analyzed metrics fall within normal ranges for authentic accounts. However, always maintain healthy skepticism online."
        : "This account shows multiple red flags suggesting it may be fake. Key concerns include abnormal engagement metrics and suspicious behavioral patterns. I'd recommend avoiding direct transactions.";
    }

    // Questions about trust score
    if (messageLower.includes("trust") || messageLower.includes("score")) {
      return `The trust score is ${r?.trustScore}/100 with ${r?.confidence}% confidence. ${r?.trustScore! >= 70 ? "This is a high score indicating a likely genuine account." : r?.trustScore! >= 40 ? "This is a moderate score indicating mixed signals." : "This is a low score indicating high fraud probability."}`;
    }

    // Questions about engagement
    if (messageLower.includes("engagement") || messageLower.includes("followers") || messageLower.includes("posts")) {
      const engagementScore = r?.breakdown.engagementQuality || 0;
      return `The engagement quality score is ${engagementScore}%. ${engagementScore >= 70 ? "This account shows healthy engagement patterns consistent with authentic users." : "There are inconsistencies in engagement metrics that suggest potential manipulation."}`;
    }

    // Questions about risk factors
    if (messageLower.includes("risk") || messageLower.includes("warning") || messageLower.includes("dangerous")) {
      const riskLevel = r?.trustScore! >= 70 ? "LOW" : r?.trustScore! >= 40 ? "MEDIUM" : "HIGH";
      return `Risk Level: ${riskLevel}. ${r?.signals.slice(0, 2).map(s => s.label).join(", ") || "No major red flags"}. Exercise appropriate caution when interacting.`;
    }

    // Questions about profile authenticity
    if (messageLower.includes("authentic") || messageLower.includes("profile") || messageLower.includes("username")) {
      const profileScore = r?.breakdown.profileAuthenticity || 0;
      return `Profile Authenticity Score: ${profileScore}%. ${profileScore >= 70 ? "The profile appears genuine with all standard authentication markers." : "The profile shows some inconsistencies that warrant further investigation."}`;
    }

    // Questions about what to do
    if (messageLower.includes("do") || messageLower.includes("action") || messageLower.includes("should")) {
      return r?.verdict === "Safe"
        ? "Since this account appears genuine, you can proceed with normal interactions. However, always follow basic online safety practices."
        : "I'd recommend: 1) Avoid direct financial transactions, 2) Don't share personal information, 3) Report if fraudulent activity is confirmed, 4) Cross-reference with other platforms.";
    }

    // Questions about specific metrics
    if (messageLower.includes("metric") || messageLower.includes("breakdown") || messageLower.includes("analysis")) {
      const metrics = Object.entries(r?.breakdown || {})
        .map(([key, val]) => `${key}: ${val}%`)
        .join(", ");
      return `Detailed Metrics: ${metrics}. These values help determine the overall account authenticity.`;
    }

    // Default helpful response
    return "I can help answer questions about this profile's authenticity, trust score, risk factors, engagement metrics, or recommendations. What would you like to know?";
  };

  // Generate detailed report explanation
  const generateReportExplanation = () => {
    return {
      profileAuthenticity: r?.breakdown.profileAuthenticity! >= 70 
        ? "Profile picture and username are consistent with authentic accounts. No suspicious pattern detected. The profile uses natural naming conventions and has a clear, identifiable profile picture typical of genuine Instagram accounts."
        : r?.breakdown.profileAuthenticity! >= 40
        ? "Profile shows some inconsistencies that warrant attention. The username or picture quality shows minor red flags, though not definitively fraudulent. Recommend cross-referencing with other social platforms."
        : "Profile shows significant inconsistencies. Picture quality is poor or suspicious, username contains excessive numbers/special characters, or other patterns strongly suggest potential manipulation or bot activity.",
      engagementQuality: r?.breakdown.engagementQuality! >= 70
        ? "Posts, followers, and following counts are in healthy proportion. Engagement metrics appear natural and consistent with authentic user behavior. The follower-to-following ratio is balanced, indicating real people following the account."
        : r?.breakdown.engagementQuality! >= 40
        ? "Engagement metrics show mixed signals. While some metrics appear normal, others show slight irregularities. The follower-to-following ratio may be slightly skewed, suggesting possible follow/unfollow tactics or partial artificial inflation."
        : "Engagement metrics show significant irregularities. High follower count with disproportionately low posts or vice versa. Follower-to-following ratio is severely imbalanced, strongly suggesting purchased followers or bot engagement.",
      networkBehavior: r?.breakdown.networkBehavior! >= 70
        ? "Account activity shows consistent posting patterns typical of genuine users. Posting frequency and engagement timing align with human behavior. No signs of bot-like or automated activity detected."
        : r?.breakdown.networkBehavior! >= 40
        ? "Account activity shows some irregular patterns. Posting frequency may be inconsistent or show brief periods of inactivity followed by bursts. Some automated behavior cannot be ruled out."
        : "Suspicious activity patterns detected. Posting frequency is erratic or shows signs of automation. Account may be using bots for scheduling, engagement, or automated responses.",
      contentConsistency: r?.breakdown.contentConsistency! >= 70
        ? "Bio, description, and profile content are coherent and authentic. Bio matches expected profile type, no suspicious links or impersonation attempts detected. Content quality and consistency suggest a real person managing the account."
        : r?.breakdown.contentConsistency! >= 40
        ? "Content shows some inconsistencies. Bio may contain unusual claims, suspicious links, or slight impersonation signals. Content quality varies, suggesting multiple posting styles or bot-generated content mix-in."
        : "Content inconsistencies are significant. Bio contains red flags like multiple suspicious links, impersonation claims, or obvious copy-paste patterns. Content lacks coherence typical of genuine accounts."
    };
  };

  // Download report function
  const downloadReport = async () => {
    setReportGenerating(true);
    
    // Generate report content
    const reportContent = `
====================================
INSTAGRAM FAKE DETECTOR REPORT
====================================

Report ID: ${r?.reportId}
Generated: ${new Date().toLocaleString()}
Analyzed Account: @${r?.username}

=====================================
EXECUTIVE SUMMARY
=====================================

Trust Score: ${r?.trustScore}/100
Verdict: ${r?.verdict === "Safe" ? "GENUINE ACCOUNT - Safe to interact" : "SUSPICIOUS ACCOUNT - Exercise extreme caution"}
Risk Level: ${r?.trustScore >= 70 ? "LOW RISK - Minimal concerns detected" : r?.trustScore >= 40 ? "MEDIUM RISK - Mixed signals present, recommend further investigation" : "HIGH RISK - Multiple red flags detected"}
Confidence Level: ${r?.confidence}% (Analysis reliability)

Summary: ${r?.verdict === "Safe" ? `This account has passed our comprehensive authenticity analysis. The account shows consistent genuine indicators across all analysis factors. However, maintain baseline caution when sharing sensitive information online.` : `This account shows multiple red flags across analysis factors. Exercise extreme caution. Do not share personal information or engage in financial transactions without independent verification.`}

====== PROFILE INFORMATION ======
Username: @${r?.username}
Posts: ${backendResult?.account_data.posts || "N/A"}
Followers: ${backendResult?.account_data.followers || "N/A"}
Following: ${backendResult?.account_data.following || "N/A"}
Follower/Following Ratio: ${backendResult?.ffr_ratio?.toFixed(2) || "N/A"} (Healthy: 0.5-2.0)

====== DETAILED ANALYSIS BREAKDOWN ======

1. PROFILE AUTHENTICITY SCORE: ${r?.breakdown.profileAuthenticity}%
   [${r?.breakdown.profileAuthenticity >= 70 ? "HIGH - Likely Genuine" : r?.breakdown.profileAuthenticity >= 40 ? "MEDIUM - Uncertain" : "LOW - Likely Fake"}]
   
   What This Measures:
   - Profile picture quality and authenticity
   - Username patterns and conventions
   - Account setup legitimacy
   
   Finding:
   ${generateReportExplanation().profileAuthenticity}
   
   Recommendation:
   ${r?.breakdown.profileAuthenticity >= 70 ? "✓ Profile visuals appear authentic. No major concerns." : r?.breakdown.profileAuthenticity >= 40 ? "⚠ Review profile picture and username patterns. Look for signs of stock photos or generic naming." : "✗ Profile shows strong signs of being fake. Consider blocking."}

---

2. ENGAGEMENT QUALITY SCORE: ${r?.breakdown.engagementQuality}%
   [${r?.breakdown.engagementQuality >= 70 ? "HIGH - Natural Engagement" : r?.breakdown.engagementQuality >= 40 ? "MEDIUM - Mixed Signals" : "LOW - Artificial Engagement"}]
   
   What This Measures:
   - Posts vs Followers ratio
   - Follower-Following balance
   - Engagement authenticity
   - Bot-purchased followers detection
   
   Follower-Following Ratio (FFR): ${backendResult?.ffr_ratio?.toFixed(2) || "N/A"}
   - Below 0.5: Very many followers relative to following (possible bought followers)
   - 0.5 - 2.0: Healthy, natural growth pattern
   - Above 2.0: Following many more than followers (typical for business/brand accounts)
   
   Finding:
   ${generateReportExplanation().engagementQuality}
   
   Recommendation:
   ${r?.breakdown.engagementQuality >= 70 ? "✓ Engagement metrics appear natural. Account growth seems organic." : r?.breakdown.engagementQuality >= 40 ? "⚠ Monitor engagement patterns. May have used artificial growth tactics." : "✗ Strong signs of artificial engagement or purchased followers."}

---

3. NETWORK BEHAVIOR SCORE: ${r?.breakdown.networkBehavior}%
   [${r?.breakdown.networkBehavior >= 70 ? "HIGH - Human Activity" : r?.breakdown.networkBehavior >= 40 ? "MEDIUM - Possible Automation" : "LOW - Bot-like Activity"}]
   
   What This Measures:
   - Posting patterns and frequency
   - Activity timing consistency
   - Bot-like behavior detection
   - Account automation indicators
   
   Red Flags to Watch:
   - Identical comments on multiple posts
   - Rapid follow/unfollow patterns
   - Posting at exact same times daily
   - Suddenly increased activity
   
   Finding:
   ${generateReportExplanation().networkBehavior}
   
   Recommendation:
   ${r?.breakdown.networkBehavior >= 70 ? "✓ Posting patterns appear natural and human-like." : r?.breakdown.networkBehavior >= 40 ? "⚠ Some automation detected. Monitor for escalation." : "✗ Account likely using automation/bots. Avoid engagement."}

---

4. CONTENT CONSISTENCY SCORE: ${r?.breakdown.contentConsistency}%
   [${r?.breakdown.contentConsistency >= 70 ? "HIGH - Authentic Content" : r?.breakdown.contentConsistency >= 40 ? "MEDIUM - Some Inconsistencies" : "LOW - Suspicious Content"}]
   
   What This Measures:
   - Bio and caption coherence
   - Impersonation detection
   - Suspicious link detection
   - Content quality consistency
   
   Impersonation Red Flags:
   - Pretending to be celebrity/brand
   - Claiming verified status without badge
   - Multiple suspicious promotional links
   - Copy-paste captions or generic content
   
   Finding:
   ${generateReportExplanation().contentConsistency}
   
   Recommendation:
   ${r?.breakdown.contentConsistency >= 70 ? "✓ Content appears authentic and coherent." : r?.breakdown.contentConsistency >= 40 ? "⚠ Review bio and recent captions for inconsistencies." : "✗ Content shows signs of impersonation or fraud. Report account."}

====== FINAL VERDICT & ACTION PLAN ======

VERDICT: ${r?.verdict === "Safe" ? "✓ GENUINE ACCOUNT" : "✗ SUSPICIOUS ACCOUNT"}

Overall Assessment:
${r?.verdict === "Safe"
  ? `This account has demonstrated sufficient indicators of authenticity across all analysis factors. The account can likely be interacted with normally, though standard internet safety practices should still be observed. Keep this report handy if behavior changes significantly.`
  : `This account demonstrates multiple suspicious indicators suggesting potential fraud, impersonation, or bot activity. Extreme caution is advised. Interaction should be minimized, and personal/financial information should never be shared.`}

Recommended Actions:
${r?.verdict === "Safe"
  ? `1. You may safely interact with this account
2. Monitor for any sudden behavioral changes or suspicious activity
3. Report if fraudulent behavior becomes apparent
4. Continue using basic online safety practices (no personal data sharing unless necessary)`
  : `1. Block this account immediately
2. Do not click any links or download files from this account
3. Never share personal or financial information
4. Consider reporting to Instagram if impersonation is suspected
5. Report to relevant authorities if fraud is involved
6. Save this report as evidence if needed`}

====== SCORE INTERPRETATION GUIDE ======

Trust Score Ranges:
- 70-100: LOW RISK - Account appears genuine
- 40-69: MEDIUM RISK - Mixed signals, further investigation recommended
- 0-39: HIGH RISK - Multiple red flags, likely fraudulent

Individual Metric Scores:
- 70-100%: ✓ Positive indicator for authenticity
- 40-69%: ⚠ Mixed signals, proceed with caution
- 0-39%: ✗ Red flag for this particular factor

Confidence Level:
- 80-100%: High confidence in analysis accuracy
- 60-79%: Medium confidence, additional data would improve accuracy
- 0-59%: Lower confidence, limited available data

====== DISCLAIMER ====================================

This report is generated by the Instagram Fake Detector AI System
and is intended as an analysis tool only. While the algorithm has
high accuracy, no automated system can guarantee 100% accuracy.

This report is NOT legal advice and should not be used as the sole
basis for legal action. For serious fraud concerns, contact local
law enforcement or Instagram's official support channels.

Always exercise caution online and use multiple verification methods
when dealing with accounts of importance.

Algorithm Version: 2.0
Analysis Date: ${new Date().toLocaleString()}

====================================
Report Generated by Instagram Fake Detector
Visit: https://social-shield.app
====================================
    `;

    // Trigger download
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent));
    element.setAttribute("download", `Report_${r?.reportId}_${new Date().getTime()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Add chatbot notification about download
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `Report downloaded successfully! File: Report_${r?.reportId}_${new Date().getTime()}.txt - This includes all analysis details, interpretation guides, and recommendations.`
    }]);

    setReportGenerating(false);
  };

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Check if user wants to download report
    if (userMessage.toLowerCase().includes("download") || userMessage.toLowerCase().includes("report") || userMessage.toLowerCase().includes("export")) {
      setIsLoading(false);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'll generate and download your analysis report now. Check your downloads folder!"
        }]);
        downloadReport();
      }, 500);
      return;
    }

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      setIsLoading(false);
    }, 800);
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
        <button onClick={() => navigate(-1)} className="btn-depress flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="data-point">REPORT: {r.reportId}</span>
          <span className="data-point">{r.timestamp.slice(0, 10)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)] px-6 py-8 overflow-hidden">
        {/* Main Dashboard - Left (Landscape) */}
        <div className="lg:col-span-3 overflow-y-auto pr-4">
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

              {/* Metrics Grid */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(r.breakdown).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <p className="label-forensic mb-1 text-xs">{key.replace(/([A-Z])/g, " $1").slice(0, 12)}</p>
                      <p className={`text-xl font-mono font-bold ${val >= 50 ? "text-evidence-high" : "text-evidence-low"}`}>
                        {val}%
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="label-forensic flex-shrink-0 text-xs">CONFIDENCE</p>
                  <div className="flex-1 h-1 bg-secondary rounded-sm overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${r.confidence}%` }} />
                  </div>
                  <span className="data-point text-xs">{r.confidence}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Block - Complete Profile Details & Trust Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="forensic-card mb-6"
          >
            {/* Report Header with Download Button */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
              <div className="flex-1">
                <p className="label-forensic mb-1 text-xs">COMPLETE PROFILE ANALYSIS REPORT</p>
                <p className="text-xs text-muted-foreground">Comprehensive analysis of profile authenticity, engagement quality, network behavior, and content consistency. This report includes detailed breakdowns of all factors contributing to the final trust score verdict.</p>
              </div>
              <button
                onClick={downloadReport}
                disabled={reportGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-semibold whitespace-nowrap ml-4"
              >
                <Download className="w-3.5 h-3.5" />
                {reportGenerating ? "Generating..." : "Download Report"}
              </button>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="label-forensic text-[10px] mb-1">USERNAME</p>
                <p className="text-[10px] text-muted-foreground mb-2">Analyzed for suspicious patterns, special characters, and naming conventions</p>
                <p className="font-mono text-sm font-bold text-foreground truncate">{r?.username}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="label-forensic text-[10px] mb-1">FOLLOWERS</p>
                <p className="text-[10px] text-muted-foreground mb-2">Total users following this account. Compared against posts and following count for ratio analysis</p>
                <p className="font-mono text-sm font-bold text-foreground">{backendResult?.account_data.followers || "N/A"}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="label-forensic text-[10px] mb-1">POSTS</p>
                <p className="text-[10px] text-muted-foreground mb-2">Content published on the account. Analyzed for consistency with follower count</p>
                <p className="font-mono text-sm font-bold text-foreground">{backendResult?.account_data.posts || "N/A"}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="label-forensic text-[10px] mb-1">FOLLOWING</p>
                <p className="text-[10px] text-muted-foreground mb-2">Accounts this user follows. Used to calculate follower-to-following ratio for authenticity</p>
                <p className="font-mono text-sm font-bold text-foreground">{backendResult?.account_data.following || "N/A"}</p>
              </div>
            </div>

            {/* Trust Score Basis & Detailed Breakdown */}
            <div className="mb-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-1">ℹ️ Understanding Your Trust Score</p>
                <p className="text-[11px] text-muted-foreground">The final trust score is calculated by analyzing four key factors. Each factor measures a different aspect of account authenticity. Scores above 70 suggest genuine accounts, while scores below 40 indicate potential fraud. The breakdown below explains how each factor contributed to the final verdict.</p>
              </div>
              
              <p className="label-forensic mb-4 text-xs">TRUST SCORE FACTORS - DETAILED BREAKDOWN</p>
              
              {/* Profile Authenticity */}
              <div className="mb-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">1. Profile Authenticity Score</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Measures visual & identity consistency including profile picture quality, username patterns, and account setup legitimacy</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${ r?.breakdown.profileAuthenticity! >= 70 ? "bg-evidence-high/20 text-evidence-high" : r?.breakdown.profileAuthenticity! >= 40 ? "bg-evidence-warning/20 text-evidence-warning" : "bg-evidence-low/20 text-evidence-low"}`}>{r?.breakdown.profileAuthenticity}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {generateReportExplanation().profileAuthenticity}
                </p>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50 space-y-1">
                  <p><strong>Score Range:</strong> 0-39% = Likely Fake | 40-69% = Uncertain | 70-100% = Likely Genuine</p>
                  <p><strong>Action:</strong> {r?.breakdown.profileAuthenticity! >= 70 ? "✓ Profile visuals appear authentic" : r?.breakdown.profileAuthenticity! >= 40 ? "⚠ Investigate profile picture and username further" : "✗ Strong indicators of fake profile"}</p>
                </div>
              </div>

              {/* Engagement Quality */}
              <div className="mb-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">2. Engagement Quality Score</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Analyzes posts, followers, and following count ratios to detect artificial engagement or purchased followers</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${r?.breakdown.engagementQuality! >= 70 ? "bg-evidence-high/20 text-evidence-high" : r?.breakdown.engagementQuality! >= 40 ? "bg-evidence-warning/20 text-evidence-warning" : "bg-evidence-low/20 text-evidence-low"}`}>{r?.breakdown.engagementQuality}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {generateReportExplanation().engagementQuality}
                </p>
                {backendResult?.ffr_ratio && (
                  <p className="text-[10px] text-muted-foreground mb-2 pt-2 border-t border-border/50">
                    <strong>Follower-Following Ratio (FFR):</strong> <span className="font-mono font-bold">{backendResult.ffr_ratio.toFixed(2)}</span> — Healthy ratio is 0.5-2.0 | Above 2.0 may indicate fake followers
                  </p>
                )}
                <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 space-y-1">
                  <p><strong>Score Range:</strong> 0-39% = Artificial Engagement | 40-69% = Mixed Signals | 70-100% = Natural Growth</p>
                  <p><strong>Action:</strong> {r?.breakdown.engagementQuality! >= 70 ? "✓ Engagement metrics appear natural" : r?.breakdown.engagementQuality! >= 40 ? "⚠ Some engagement manipulation possible" : "✗ Strong signs of artificial engagement"}</p>
                </div>
              </div>

              {/* Network Behavior */}
              <div className="mb-4 p-4 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">3. Network Behavior Score</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Detects patterns of bot activity, automation, and suspicious behavioral trends in posting and interactions</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${r?.breakdown.networkBehavior! >= 70 ? "bg-evidence-high/20 text-evidence-high" : r?.breakdown.networkBehavior! >= 40 ? "bg-evidence-warning/20 text-evidence-warning" : "bg-evidence-low/20 text-evidence-low"}`}>{r?.breakdown.networkBehavior}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {generateReportExplanation().networkBehavior}
                </p>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50 space-y-1">
                  <p><strong>Score Range:</strong> 0-39% = Likely Bot/Automated | 40-69% = Some Automation Possible | 70-100% = Human-Like Activity</p>
                  <p><strong>Red Flags:</strong> Irregular posting times, rapid follow/unfollow patterns, identical comments on multiple posts</p>
                  <p><strong>Action:</strong> {r?.breakdown.networkBehavior! >= 70 ? "✓ Posting patterns appear natural" : r?.breakdown.networkBehavior! >= 40 ? "⚠ Monitor for bot-like behavior" : "✗ Likely automated or bot account"}</p>
                </div>
              </div>

              {/* Content Consistency */}
              <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">4. Content Consistency Score</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Evaluates bio, captions, and overall content coherence for impersonation or fraudulent claims</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${r?.breakdown.contentConsistency! >= 70 ? "bg-evidence-high/20 text-evidence-high" : r?.breakdown.contentConsistency! >= 40 ? "bg-evidence-warning/20 text-evidence-warning" : "bg-evidence-low/20 text-evidence-low"}`}>{r?.breakdown.contentConsistency}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {generateReportExplanation().contentConsistency}
                </p>
                <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50 space-y-1">
                  <p><strong>Score Range:</strong> 0-39% = Suspicious/Impersonation | 40-69% = Some Inconsistencies | 70-100% = Authentic & Coherent</p>
                  <p><strong>Check For:</strong> Multiple promotional links, impersonation claims, generic or AI-generated captions</p>
                  <p><strong>Action:</strong> {r?.breakdown.contentConsistency! >= 70 ? "✓ Content appears authentic" : r?.breakdown.contentConsistency! >= 40 ? "⚠ Review bio and recent captions" : "✗ Strong signs of impersonation or fraud"}</p>
                </div>
              </div>
            </div>

            {/* Final Verdict Box */}
            <div className={`p-4 rounded-lg border-2 ${r?.verdict === "Safe" ? "bg-evidence-high/10 border-evidence-high/30" : "bg-evidence-low/10 border-evidence-low/30"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="label-forensic text-xs">FINAL DIAGNOSIS & RECOMMENDATIONS</p>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-sm ${r?.trustScore >= 70 ? "border-evidence-high/30 text-evidence-high bg-evidence-high/10" : r?.trustScore >= 40 ? "border-evidence-warning/30 text-evidence-warning bg-evidence-warning/10" : "border-evidence-low/30 text-evidence-low bg-evidence-low/10"}`}>
                  Risk Level: {r?.trustScore >= 70 ? "LOW" : r?.trustScore >= 40 ? "MEDIUM" : "HIGH"}
                </span>
              </div>
              
              <p className={`text-sm font-bold mb-2 ${r?.verdict === "Safe" ? "text-evidence-high" : "text-evidence-low"}`}>
                {r?.verdict === "Safe" ? "✓ VERDICT: GENUINE ACCOUNT" : "✗ VERDICT: SUSPICIOUS ACCOUNT"}
              </p>
              
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {r?.verdict === "Safe"
                  ? `This account has passed our comprehensive authenticity analysis with a trust score of ${r?.trustScore}/100. The account shows consistent genuine indicators across all analysis factors. However, always maintain baseline caution when sharing personal or financial information online, as new threats emerge constantly.`
                  : `This account shows multiple red flags across our analysis factors with a trust score of only ${r?.trustScore}/100. Exercise extreme caution when interacting. Do not share personal information or engage in financial transactions unless you can independently verify the account's legitimacy through official channels.`
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">CONFIDENCE LEVEL:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${r?.confidence}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-foreground">{r?.confidence}%</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {r?.confidence >= 80 ? "High confidence - Analysis is reliable" : r?.confidence >= 60 ? "Medium confidence - Additional data would help" : "Lower confidence - Limited data available"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">WHAT TO DO NEXT:</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    {r?.verdict === "Safe"
                      ? "Monitor the account for changes. If large behavioral shifts occur, re-run this analysis. Follow basic online safety practices."
                      : "Block or report this account. Research if it's impersonating someone you know. Never click suspicious links or download files from this account."
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analysis Criteria - Horizontal */}
          <div className="mb-6">
            <h3 className="label-forensic mb-3 text-xs">ANALYSIS CRITERIA</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reportCriteria.map((criteria, idx) => {
                const CriteriaIcon = criteria.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: idx * 0.05 }}
                    className="p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <CriteriaIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-xs text-foreground mb-1">{criteria.name}</p>
                        <p className="text-[10px] text-muted-foreground">{criteria.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Key Findings */}
          <div className="mb-6">
            <h3 className="label-forensic mb-3 text-xs">KEY FINDINGS</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {r.signals.map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  className={`p-3 rounded-lg border text-xs ${signal.type === "risk" ? "bg-evidence-low/10 border-evidence-low/30" : "bg-evidence-high/10 border-evidence-high/30"}`}
                >
                  <div className="flex items-start gap-2">
                    {signal.type === "risk" && <XCircle className="w-3.5 h-3.5 text-evidence-low flex-shrink-0 mt-0.5" />}
                    {signal.type === "safe" && <CheckCircle2 className="w-3.5 h-3.5 text-evidence-high flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-0.5">{signal.label}</p>
                      <p className="text-muted-foreground line-clamp-2">{signal.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div className="mb-6">
            <h3 className="label-forensic mb-3 text-xs">DETAILED BREAKDOWN</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(r.breakdown).map(([key, val]) => (
                <div key={key} className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <p className="label-forensic mb-2 text-[10px]">{key.replace(/([A-Z])/g, " $1")}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${val >= 70 ? "bg-evidence-high" : val >= 40 ? "bg-evidence-warning" : "bg-evidence-low"}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-bold ${val >= 70 ? "text-evidence-high" : val >= 40 ? "text-evidence-warning" : "text-evidence-low"}`}>
                      {val}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="forensic-card p-4"
          >
            <h3 className="label-forensic mb-3 text-xs">REPORT DETAILS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Report ID</p>
                <p className="data-point font-mono text-xs">{r.reportId}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Target</p>
                <p className="data-point font-mono text-xs truncate">{r.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Date</p>
                <p className="data-point font-mono text-xs">{r.timestamp.slice(0, 10)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chatbot Panel - Right (Portrait) */}
        <div className="lg:col-span-1 bg-card border border-border rounded-lg flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Profile Assistant</h3>
            </div>
            <p className="text-xs text-muted-foreground">Ask about this account's analysis</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-secondary text-foreground p-3 rounded-lg rounded-bl-none text-xs flex items-center gap-2">
                  <Loader className="w-3 h-3 animate-spin" />
                  Analyzing...
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about this account..."
                className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
