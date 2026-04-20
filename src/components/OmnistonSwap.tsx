import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, Loader2, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { apiClient, type StonfiConfig, type StonfiQuote, type StonfiToken } from "@/lib/api";
import { useWallet } from "@/hooks/useWallet";
import { useWalletNetwork } from "@/hooks/useWalletNetwork";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SwapButtonProps = {
  referrerAddress?: string;
  referrerFeeBps?: number;
  className?: string;
  children?: React.ReactNode;
};

type TabKey = "swap" | "widget";

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

function tokenLabel(token?: StonfiToken) {
  return token ? `${token.symbol} · ${token.name}` : "Select token";
}

export const OmnistonSwapButton: React.FC<SwapButtonProps> = ({
  referrerAddress,
  referrerFeeBps = 30,
  className = "",
  children,
}) => {
  const [tonConnectUI] = useTonConnectUI();
  const { connected, address, sendTransaction } = useWallet();
  const { label: networkLabel } = useWalletNetwork();

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>("swap");
  const [config, setConfig] = React.useState<StonfiConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(false);
  const [offerToken, setOfferToken] = React.useState("");
  const [askToken, setAskToken] = React.useState("");
  const [amount, setAmount] = React.useState("0.1");
  const [quote, setQuote] = React.useState<StonfiQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [swapLoading, setSwapLoading] = React.useState(false);
  const [tradeStatus, setTradeStatus] = React.useState<string>("");
  const [widgetLoading, setWidgetLoading] = React.useState(false);
  const widgetRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const tokens = config?.tokens ?? [];

  const refreshConfig = React.useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const response = await apiClient.getStonfiConfig();
      const nextConfig = response.data.data.config;
      setConfig(nextConfig);
      setOfferToken((current) => current || nextConfig.tokens[0]?.address || "");
      setAskToken((current) => {
        if (current) {
          return current;
        }
        return nextConfig.tokens.find((token) => token.address !== (nextConfig.tokens[0]?.address || ""))?.address || nextConfig.tokens[0]?.address || "";
      });
    } catch (error) {
      toast.error("Failed to load STON.fi config.");
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    void refreshConfig();
  }, [isOpen, refreshConfig]);

  React.useEffect(() => {
    setQuote(null);
    setTradeStatus("");
  }, [offerToken, askToken, amount, config?.network]);

  React.useEffect(() => {
    if (!isOpen || activeTab !== "widget") {
      if (widgetRef.current) {
        widgetRef.current.unmount();
        widgetRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setWidgetLoading(true);

    loadOmnistonWidget()
      .then((OmnistonWidget) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        const widgetConfig: OmnistonWidgetConfig = {
          tonconnect: {
            type: "integrated",
            instance: tonConnectUI,
          },
          widget: {
            defaultAssets: true,
            defaultBidAsset: offerToken || undefined,
            defaultAskAsset: askToken || undefined,
            referrerAddress,
            referrerFeeBps,
          },
        };

        widgetRef.current = new OmnistonWidget(widgetConfig);
        widgetRef.current.mount(containerRef.current);
      })
      .catch(() => {
        toast.error("Failed to load STON.fi widget.");
      })
      .finally(() => {
        if (!cancelled) {
          setWidgetLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (widgetRef.current) {
        widgetRef.current.unmount();
        widgetRef.current = null;
      }
    };
  }, [activeTab, askToken, isOpen, offerToken, referrerAddress, referrerFeeBps, tonConnectUI]);

  const selectedOfferToken = tokens.find((token) => token.address === offerToken);
  const selectedAskToken = tokens.find((token) => token.address === askToken);

  const handleQuote = async () => {
    if (!offerToken || !askToken || !amount || Number(amount) <= 0) {
      toast.error("Fill token pair and amount first.");
      return;
    }

    setQuoteLoading(true);
    setTradeStatus("");
    try {
      const response = await apiClient.quoteStonfiSwap({
        offerToken,
        askToken,
        amount,
      });
      setQuote(response.data.data.quote);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to fetch quote.";
      toast.error(message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!connected || !address) {
      toast.error("Connect your wallet first.");
      return;
    }

    if (!quote) {
      toast.error("Get a quote first.");
      return;
    }

    setSwapLoading(true);
    setTradeStatus("Sending transaction...");

    try {
      const buildResponse = await apiClient.buildStonfiSwap({
        offerToken,
        askToken,
        sourceAddress: address,
        destinationAddress: address,
        quote: quote.rawQuote,
      });

      const tx = await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: buildResponse.data.data.swap.txParams.messages,
      });

      toast.success("Swap transaction sent.");
      setTradeStatus("Transaction sent. Tracking status...");

      if (tx?.boc) {
        void apiClient.trackStonfiSwap({
          quoteId: quote.quoteId,
          walletAddress: address,
          txBoc: tx.boc,
        }).then((response) => {
          const status = response.data.data.trade.status;
          setTradeStatus(`Trade status: ${status}`);
          toast.success(`STON.fi trade status: ${status}`);
        }).catch(() => {
          setTradeStatus("Transaction sent. Tracking is still pending.");
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to execute swap.";
      setTradeStatus("");
      toast.error(message);
    } finally {
      setSwapLoading(false);
    }
  };

  const handleClose = () => {
    if (widgetRef.current) {
      widgetRef.current.unmount();
      widgetRef.current = null;
    }
    setIsOpen(false);
  };

  const modal = isOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stonfi-swap-title"
        >
          <button
            type="button"
            aria-label="Close swap"
            className="absolute inset-0 cursor-default"
            onClick={handleClose}
          />
          <div
            className="relative z-[1] w-full max-w-md rounded-3xl border-2 border-border bg-card p-5 shadow-lg pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 z-[2] rounded-xl bg-muted px-3 py-1.5 font-display font-bold press-effect"
            >
              Close
            </button>

            <div className="mb-4">
              <p id="stonfi-swap-title" className="font-display text-xl font-bold">
                STON.fi Swap
              </p>
              <p className="text-xs text-muted-foreground mt-1">{networkLabel} · Wallet-aware quote and swap</p>
            </div>

            <div className="mb-4 flex gap-2 rounded-2xl border-2 border-border bg-muted p-1">
              {(["swap", "widget"] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-sm font-display font-bold capitalize press-effect",
                    activeTab === tab ? "bg-card text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "swap" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <span>Supported assets</span>
                  <button
                    type="button"
                    onClick={() => void refreshConfig()}
                    className="inline-flex items-center gap-1 font-display font-bold text-foreground"
                    disabled={isLoadingConfig}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoadingConfig && "animate-spin")} /> Refresh
                  </button>
                </div>

                {isLoadingConfig ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-muted py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading token list…</p>
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-muted px-3 py-6 text-center text-sm text-muted-foreground">
                    No STON.fi assets returned for this network. Try Refresh or check the API.
                  </div>
                ) : (
                  <>
                    <div className="block">
                      <span className="text-xs font-bold uppercase text-muted-foreground">From</span>
                      <Select value={offerToken} onValueChange={setOfferToken}>
                        <SelectTrigger
                          type="button"
                          className="mt-1 h-auto min-h-[48px] w-full rounded-2xl border-2 border-border bg-muted px-3 py-3 font-display font-bold"
                        >
                          <SelectValue placeholder={tokenLabel(selectedOfferToken)} />
                        </SelectTrigger>
                        <SelectContent className="z-[300] max-h-[min(280px,50vh)]" position="popper">
                          {tokens.map((token) => (
                            <SelectItem key={token.address} value={token.address} className="font-display">
                              {tokenLabel(token)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="block">
                      <span className="text-xs font-bold uppercase text-muted-foreground">To</span>
                      <Select value={askToken} onValueChange={setAskToken}>
                        <SelectTrigger
                          type="button"
                          className="mt-1 h-auto min-h-[48px] w-full rounded-2xl border-2 border-border bg-muted px-3 py-3 font-display font-bold"
                        >
                          <SelectValue placeholder={tokenLabel(selectedAskToken)} />
                        </SelectTrigger>
                        <SelectContent className="z-[300] max-h-[min(280px,50vh)]" position="popper">
                          {tokens.map((token) => (
                            <SelectItem key={token.address} value={token.address} className="font-display">
                              {tokenLabel(token)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <label className="block">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Amount</span>
                      <div className="mt-1 flex items-center gap-2 rounded-2xl border-2 border-border bg-muted px-3 py-3">
                        <input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          type="number"
                          min="0"
                          step="any"
                          className="flex-1 bg-transparent font-display font-bold outline-none"
                        />
                        <span className="text-sm font-display font-bold text-muted-foreground">{selectedOfferToken?.symbol || "TOKEN"}</span>
                      </div>
                    </label>

                    {quote ? (
                      <div className="rounded-2xl border border-border bg-muted p-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Best quote</p>
                        <p className="mt-1 font-display text-lg font-bold">
                          {quote.offerDisplay} {quote.offerToken.symbol} → {quote.askDisplay} {quote.askToken.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Resolver: {quote.resolverName}</p>
                      </div>
                    ) : null}

                    {tradeStatus ? (
                      <div className="rounded-2xl border border-border bg-muted p-3 text-sm text-muted-foreground">{tradeStatus}</div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => void handleQuote()}
                        disabled={quoteLoading || !offerToken || !askToken || !amount}
                        className="rounded-2xl border-2 border-border bg-card py-3 font-display font-bold press-effect disabled:opacity-50"
                      >
                        {quoteLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Get Quote"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSwap()}
                        disabled={swapLoading || !quote || !connected}
                        className="rounded-2xl bg-accent py-3 font-display font-bold text-accent-foreground press-effect disabled:opacity-50"
                      >
                        {swapLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Swap"}
                      </button>
                    </div>

                    {!connected ? (
                      <div className="rounded-2xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground inline-flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Connect wallet before swapping.
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Fallback STON.fi widget using your current TonConnect session.</p>
                {widgetLoading ? (
                  <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-muted">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : null}
                <div ref={containerRef} className="min-h-[500px] rounded-2xl overflow-hidden border border-border bg-card" />
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-2xl py-3 px-4 font-display font-bold press-effect pop-shadow-accent ${className}`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          {children || "Convert"}
        </button>
      ) : null}
      {modal}
    </>
  );
};

export default OmnistonSwapButton;
