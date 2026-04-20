import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Globe2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notifyAuthChanged } from '@/hooks/useAuthToken';
import { useWallet } from '@/hooks/useWallet';
import type { WalletNetwork } from '@/providers/WalletNetworkProvider';

export function NetworkSwitcher() {
  const queryClient = useQueryClient();
  const { connected, disconnect, preferredNetwork, setPreferredNetwork } = useWallet();
  const [isSwitching, setIsSwitching] = React.useState(false);

  const handleSwitch = React.useCallback(
    async (nextNetwork: WalletNetwork) => {
      if (preferredNetwork === nextNetwork || isSwitching) {
        return;
      }

      setIsSwitching(true);
      const wasConnected = connected;
      let loadingId: string | number | undefined;

      try {
        // TON Connect forbids changing connection network while connected; disconnect first.
        if (wasConnected) {
          loadingId = toast.loading('Disconnecting wallet…');
          localStorage.removeItem('auth_token');
          notifyAuthChanged();
          await disconnect();
          toast.dismiss(loadingId);
          loadingId = undefined;
        }

        setPreferredNetwork(nextNetwork);
        queryClient.clear();

        toast.success(
          wasConnected
            ? `Switched to ${nextNetwork}. Connect your wallet again on this network.`
            : `Switched to ${nextNetwork}.`
        );
      } catch (e) {
        if (loadingId !== undefined) {
          toast.dismiss(loadingId);
        }
        console.error(e);
        toast.error('Could not switch network. Try again.');
      } finally {
        setIsSwitching(false);
      }
    },
    [connected, disconnect, isSwitching, preferredNetwork, queryClient, setPreferredNetwork]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isSwitching}
          className="gap-2 bg-card border-2 border-border hover:bg-muted font-display font-bold px-3"
        >
          {isSwitching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{preferredNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="font-display">Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSwitching}
          onClick={() => void handleSwitch('testnet')}
          className="cursor-pointer"
        >
          Testnet
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isSwitching}
          onClick={() => void handleSwitch('mainnet')}
          className="cursor-pointer"
        >
          Mainnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
