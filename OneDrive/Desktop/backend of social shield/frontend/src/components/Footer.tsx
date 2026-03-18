import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-sm text-foreground">SOCIAL SHIELD</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">About</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Disclaimer</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Contact</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="data-point text-[10px]">
            DISCLAIMER: AI-BASED ANALYSIS. RESULTS ARE PROBABILISTIC AND SHOULD NOT BE USED AS SOLE BASIS FOR DECISIONS.
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            © 2026 Social Shield. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
