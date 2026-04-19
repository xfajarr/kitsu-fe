import * as React from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";

declare global {
  interface Window {
    OmnistonWidget: any;
  }
}

interface OmnistonWidgetConfig {
  tonconnect: {
    type: "standalone" | "integrated";
    options?: {
      manifestUrl?: string;
    };
    instance?: any;
  };
  widget?: {
    defaultBidAsset?: string;
    defaultAskAsset?: string;
    defaultAssets?: boolean;
    customAssets?: string[];
    referrerAddress?: string;
    referrerFeeBps?: number;
  };
}

export function loadOmnistonWidget(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.OmnistonWidget) {
      resolve(window.OmnistonWidget);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://widget.ston.fi/v0/index.js";
    script.onload = () => resolve(window.OmnistonWidget);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

interface SwapButtonProps {
  referrerAddress?: string;
  referrerFeeBps?: number;
  className?: string;
  children?: React.ReactNode;
}

export const OmnistonSwapButton: React.FC<SwapButtonProps> = ({
  referrerAddress,
  referrerFeeBps = 30,
  className = "",
  children,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const widgetRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && !widgetRef.current) {
      setIsLoading(true);
      loadOmnistonWidget()
        .then((OmnistonWidget) => {
          if (!containerRef.current) return;

          const config: OmnistonWidgetConfig = {
            tonconnect: {
              type: "standalone",
              options: {
                manifestUrl: "/tonconnect-manifest.json",
              },
            },
            widget: {
              defaultAssets: true,
              referrerAddress: referrerAddress,
              referrerFeeBps: referrerFeeBps,
            },
          };

          widgetRef.current = new OmnistonWidget(config);
          widgetRef.current.mount(containerRef.current);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load Omniston widget:", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, referrerAddress, referrerFeeBps]);

  const handleClose = () => {
    if (widgetRef.current) {
      widgetRef.current.unmount();
      widgetRef.current = null;
    }
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md mx-4">
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 bg-muted border border-border text-foreground rounded-xl py-2 px-4 font-display font-bold press-effect"
          >
            Close ✕
          </button>
          <div
            ref={containerRef}
            className="bg-card border-2 border-border rounded-2xl overflow-hidden"
            style={{ minHeight: "500px" }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-2xl py-3 px-4 font-display font-bold press-effect pop-shadow-accent ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ArrowLeftRight className="w-5 h-5" />
          {children || "Convert"}
        </>
      )}
    </button>
  );
};

export default OmnistonSwapButton;
