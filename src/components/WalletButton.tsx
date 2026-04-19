import * as React from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, Copy, LogOut, Check, ExternalLink } from "lucide-react";
import { notifyAuthChanged } from "@/hooks/useAuthToken";

export function WalletButton() {
  const { address, chain, connected, connecting, connect, disconnect, shortenAddress } = useWallet();
  const [copied, setCopied] = React.useState(false);

  const explorerBaseUrl = chain === "-3" ? "https://testnet.tonviewer.com" : "https://tonviewer.com";

  const handleCopyAddress = React.useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  if (!connected) {
    return (
      <Button
        onClick={connect}
        disabled={connecting}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold"
      >
        <Wallet className="w-4 h-4" />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-card border-2 border-border hover:bg-muted font-display font-bold"
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Wallet className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">{shortenAddress(address || "")}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-display">
          <div className="flex flex-col space-y-1">
            <p className="text-xs text-muted-foreground">Connected Wallet</p>
            <p className="text-sm font-mono">{shortenAddress(address || "")}</p>
            <p className="text-xs text-muted-foreground">{chain === "-3" ? "Testnet" : "Mainnet"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="gap-2 cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 text-success-foreground" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`${explorerBaseUrl}/${address}`, "_blank")}
          className="gap-2 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            localStorage.removeItem("auth_token");
            notifyAuthChanged();
            await disconnect();
          }}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
