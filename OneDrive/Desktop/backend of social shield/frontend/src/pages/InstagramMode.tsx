import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Search, FileText, CheckCircle2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const spring = { type: "spring" as const, duration: 0.5, bounce: 0 };

const InstagramMode = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"auto" | "manual" | null>(null);
  const [username, setUsername] = useState("");
  const [manualData, setManualData] = useState({
    username: "", fullName: "", bio: "", posts: "",
    followers: "", following: "", notes: "",
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  // Track which optional fields are visible
  const [activeFields, setActiveFields] = useState({
    username: true,
    fullName: false,
    bio: false,
    posts: false,
    followers: false,
    following: false,
    notes: false,
  });

  const toggleField = (field: keyof typeof activeFields) => {
    setActiveFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const hasFormData = () => {
    return Object.entries(activeFields).some(
      ([field, isActive]) => isActive && manualData[field as keyof typeof manualData]?.toString().trim()
    );
  };

  const canSubmit = () => {
    return screenshot !== null || hasFormData();
  };

  const handleAutoSubmit = () => {
    if (!username.trim()) return;
    navigate("/scanning", { state: { mode: "auto", username } });
  };

  const handleManualSubmit = () => {
    if (!canSubmit()) {
      toast.error("Please provide at least a screenshot or fill in any form field");
      return;
    }

    // Build payload with only active/filled fields
    const payload: any = {
      profilePic,
      screenshot
    };

    // Add only the data for active and non-empty fields
    Object.entries(activeFields).forEach(([field, isActive]) => {
      if (isActive) {
        const value = manualData[field as keyof typeof manualData];
        if (value && value.toString().trim()) {
          payload[field] = value;
        }
      }
    });

    navigate("/scanning", {
      state: {
        mode: "manual",
        ...payload
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-8 py-6 border-b border-border">
        <button onClick={() => navigate("/platform")} className="btn-depress flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <span className="data-point">STEP 2 / 3 — INSTAGRAM AUDIT</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mode selection */}
        <AnimatePresence mode="wait">
          {mode === null && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-10">
                <p className="label-forensic mb-3">INPUT METHOD</p>
                <h1 className="text-4xl font-medium tracking-tighter text-foreground">
                  Select Analysis Mode
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("auto")}
                  className="forensic-card text-left btn-depress border-evidence-high/20 hover:border-evidence-high/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-evidence-high" />
                    <span className="label-forensic text-evidence-high">AUTO MODE</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Automated Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    For public accounts. Enter username and our system retrieves all data automatically.
                  </p>
                </button>

                <button
                  onClick={() => setMode("manual")}
                  className="forensic-card text-left btn-depress border-primary/20 hover:border-primary/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="label-forensic text-primary">MANUAL MODE</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Manual Dossier</h3>
                  <p className="text-sm text-muted-foreground">
                    For public + private accounts. Upload screenshots and fill profile data manually.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {mode === "auto" && (
            <motion.div
              key="auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="w-full max-w-lg"
            >
              <button onClick={() => setMode(null)} className="text-muted-foreground hover:text-foreground text-sm mb-8 flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Change mode
              </button>
              <p className="label-forensic mb-3 text-evidence-high">AUTO MODE — PUBLIC ACCOUNTS</p>
              <h2 className="text-3xl font-medium tracking-tighter text-foreground mb-8">
                Enter Target Username
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="label-forensic mb-2 block">USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="input-forensic text-lg"
                  />
                </div>
                <button
                  onClick={handleAutoSubmit}
                  disabled={!username.trim()}
                  className="btn-depress w-full bg-primary text-primary-foreground py-3 rounded-sm font-semibold text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Begin Analysis
                </button>
              </div>
            </motion.div>
          )}

          {mode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="w-full max-w-2xl"
            >
              <button onClick={() => setMode(null)} className="text-muted-foreground hover:text-foreground text-sm mb-8 flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Change mode
              </button>
              <p className="label-forensic mb-3 text-primary">MANUAL MODE — FLEXIBLE DOSSIER</p>
              <h2 className="text-3xl font-medium tracking-tighter text-foreground mb-2">
                Build Profile Data
              </h2>
              <p className="text-xs text-muted-foreground mb-8">Add or remove fields as needed. Analysis uses only provided data.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile picture upload */}
                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="cursor-pointer flex-shrink-0">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center overflow-hidden">
                      {profilePic ? (
                        <img src={URL.createObjectURL(profilePic)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
                  </label>
                  <div>
                    <p className="label-forensic mb-1">PROFILE PICTURE</p>
                    <p className="text-xs text-muted-foreground">{profilePic ? profilePic.name : "Upload target's profile image"}</p>
                  </div>
                </div>

                {/* Screenshot upload */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-forensic">SCREENSHOT</label>
                    <span className="text-xs text-primary/60">Optional</span>
                  </div>
                  <label className="cursor-pointer input-forensic flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    {screenshot ? (
                      <><CheckCircle2 className="w-4 h-4 text-evidence-high" /> {screenshot.name}</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload screenshot</>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                  </label>
                  {screenshot && (
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2"
                    >
                      Remove screenshot
                    </button>
                  )}
                </div>

                <p className="md:col-span-2 text-xs text-primary/70 mb-2 uppercase tracking-widest">Add or Remove Fields:</p>

                {/* USERNAME - Default active and required if no other data */}
                {activeFields.username && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">USERNAME</label>
                      <button
                        type="button"
                        onClick={() => toggleField("username")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.username} 
                      onChange={(e) => setManualData(d => ({ ...d, username: e.target.value }))} 
                      placeholder="@username" 
                    />
                  </div>
                )}
                {!activeFields.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">USERNAME</span>
                    <button
                      type="button"
                      onClick={() => toggleField("username")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* FULL NAME */}
                {activeFields.fullName && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">FULL NAME</label>
                      <button
                        type="button"
                        onClick={() => toggleField("fullName")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.fullName} 
                      onChange={(e) => setManualData(d => ({ ...d, fullName: e.target.value }))} 
                      placeholder="John Doe" 
                    />
                  </div>
                )}
                {!activeFields.fullName && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">FULL NAME</span>
                    <button
                      type="button"
                      onClick={() => toggleField("fullName")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* BIO */}
                {activeFields.bio && (
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">BIO</label>
                      <button
                        type="button"
                        onClick={() => toggleField("bio")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.bio} 
                      onChange={(e) => setManualData(d => ({ ...d, bio: e.target.value }))} 
                      placeholder="Profile bio text" 
                    />
                  </div>
                )}
                {!activeFields.bio && (
                  <div className="md:col-span-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">BIO</span>
                    <button
                      type="button"
                      onClick={() => toggleField("bio")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* FOLLOWERS */}
                {activeFields.followers && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">FOLLOWERS</label>
                      <button
                        type="button"
                        onClick={() => toggleField("followers")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.followers} 
                      onChange={(e) => setManualData(d => ({ ...d, followers: e.target.value }))} 
                      placeholder="12,400" 
                    />
                  </div>
                )}
                {!activeFields.followers && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">FOLLOWERS</span>
                    <button
                      type="button"
                      onClick={() => toggleField("followers")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* FOLLOWING */}
                {activeFields.following && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">FOLLOWING</label>
                      <button
                        type="button"
                        onClick={() => toggleField("following")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.following} 
                      onChange={(e) => setManualData(d => ({ ...d, following: e.target.value }))} 
                      placeholder="340" 
                    />
                  </div>
                )}
                {!activeFields.following && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">FOLLOWING</span>
                    <button
                      type="button"
                      onClick={() => toggleField("following")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* POSTS COUNT */}
                {activeFields.posts && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">POSTS COUNT</label>
                      <button
                        type="button"
                        onClick={() => toggleField("posts")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.posts} 
                      onChange={(e) => setManualData(d => ({ ...d, posts: e.target.value }))} 
                      placeholder="89" 
                    />
                  </div>
                )}
                {!activeFields.posts && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">POSTS COUNT</span>
                    <button
                      type="button"
                      onClick={() => toggleField("posts")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                {/* NOTES */}
                {activeFields.notes && (
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-forensic">ADDITIONAL NOTES</label>
                      <button
                        type="button"
                        onClick={() => toggleField("notes")}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-evidence-high"
                      >
                        <Minus className="w-3 h-3" /> Subtract
                      </button>
                    </div>
                    <input 
                      className="input-forensic" 
                      value={manualData.notes} 
                      onChange={(e) => setManualData(d => ({ ...d, notes: e.target.value }))} 
                      placeholder="Any suspicious observations..." 
                    />
                  </div>
                )}
                {!activeFields.notes && (
                  <div className="md:col-span-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">ADDITIONAL NOTES</span>
                    <button
                      type="button"
                      onClick={() => toggleField("notes")}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}

                <div className="md:col-span-2">
                  <button
                    onClick={handleManualSubmit}
                    disabled={!canSubmit()}
                    className="btn-depress w-full bg-primary text-primary-foreground py-3 rounded-sm font-semibold text-sm uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    {screenshot ? "Analyze with Screenshot" : "Analyze Form Data"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstagramMode;
