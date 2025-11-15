import { Link } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit";
import { Menu } from "lucide-react";

interface MinimalHeaderProps {
  onMenuClick: () => void;
}

export function MinimalHeader({ onMenuClick }: MinimalHeaderProps) {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <Link
              to="/"
              className="flex items-center gap-0 font-bold text-lg"
            >
              <img
                src="/logo.png"
                alt="Suiter Logo"
                className="h-16 w-16"
              />
              <span className="hidden sm:inline-block">Suitter</span>
            </Link>
          </div>

          <div className="z-100">
            <ConnectButton className="border-2 p-2 rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
}
