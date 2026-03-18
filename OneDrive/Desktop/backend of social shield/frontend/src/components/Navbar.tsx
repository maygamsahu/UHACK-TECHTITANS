import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Activity, RefreshCw } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/health");
            const data = await res.json();
            setHealth(data);
        } catch (err) {
            setHealth({ status: "offline", version: "unknown" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    if (location.pathname === "/" || location.pathname === "/scanning") return null;

    return (
        <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <Shield className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                    <span className="font-display font-bold text-foreground tracking-tight text-sm">
                        SOCIAL SHIELD
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/platform"
                            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${location.pathname === "/platform" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Audits
                        </Link>
                        <Link
                            to="/instagram"
                            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${location.pathname === "/instagram" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Instagram
                        </Link>
                    </div>

                    <div className="h-4 w-px bg-border hidden md:block" />

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                                System Status
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${health?.status === "healthy" ? "bg-evidence-high" : "bg-evidence-low"
                                    }`} />
                                <span className={`text-[10px] font-mono font-bold ${health?.status === "healthy" ? "text-evidence-high" : "text-evidence-low"
                                    }`}>
                                    {health?.status?.toUpperCase() || "UNKNOWN"}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={checkHealth}
                            disabled={loading}
                            className={`p-1.5 rounded-sm hover:bg-secondary transition-colors ${loading ? "animate-spin" : ""}`}
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
