import { Link } from "react-router-dom";
import { ConnectButton, useConnectWallet } from "@mysten/dapp-kit";
import { Menu } from "lucide-react";

interface MinimalHeaderProps {
  onMenuClick: () => void;
}

export function MinimalHeader({ onMenuClick }: MinimalHeaderProps) {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-lg pointer-events-none"
          >
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center pointer-events-auto">
              <span className="text-background font-mono text-xs font-bold pointer-events-auto">
                S
              </span>
            </div>
            <span className="hidden sm:inline font-mono pointer-events-auto">
              suiter
            </span>
          </Link>

          <div className="ml-auto">
            <ConnectButton className="border-2 p-2 rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
}
