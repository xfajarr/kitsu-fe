import * as React from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useConnectWallet } from "@/hooks/queries/useUser";
import { notifyAuthChanged } from "@/hooks/useAuthToken";
import { toast } from "sonner";

/**
 * Requests ton_proof on connect and exchanges it for a JWT via POST /auth/connect.
 */
export function WalletAuthSync() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const connectWallet = useConnectWallet();
  const lastAuthKey = React.useRef<string | null>(null);
  const isLocalhost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  React.useEffect(() => {
    const payload =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: payload },
    });
  }, [tonConnectUI]);

  React.useEffect(() => {
    return tonConnectUI.onStatusChange(async (w) => {
      if (!w) {
        lastAuthKey.current = null;
        return;
      }
      const proofItem = w.connectItems?.tonProof;
      if (!proofItem || !("proof" in proofItem)) {
        if (!isLocalhost) {
          return;
        }

        const localKey = `${w.account.address}:local-dev`;
        if (lastAuthKey.current === localKey) {
          return;
        }

        lastAuthKey.current = localKey;
        try {
          await connectWallet.mutateAsync({
            address: w.account.address,
            timestamp: Math.floor(Date.now() / 1000),
          });
          notifyAuthChanged();
          toast.success("Local wallet connected in dev mode.");
        } catch {
          lastAuthKey.current = null;
          toast.error("Local dev wallet auth failed.");
        }
        return;
      }
      const { signature, timestamp } = proofItem.proof;
      const address = w.account.address;
      const key = `${address}:${signature.slice(0, 32)}`;
      if (lastAuthKey.current === key) {
        return;
      }
      lastAuthKey.current = key;
      try {
        await connectWallet.mutateAsync({ address, signature, timestamp });
        notifyAuthChanged();
      } catch {
        lastAuthKey.current = null;
        toast.error("Could not sign in with your wallet. Try reconnecting.");
      }
    });
  }, [tonConnectUI, connectWallet, isLocalhost]);

  // If wallet restored from storage without proof, keep existing JWT (if any).
  React.useEffect(() => {
    if (wallet && !wallet.connectItems?.tonProof && localStorage.getItem("auth_token")) {
      notifyAuthChanged();
    }
  }, [wallet]);

  return null;
}
