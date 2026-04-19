import * as React from 'react';
import { Globe2 } from 'lucide-react';
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
  const { chain, connected, disconnect, preferredNetwork, setPreferredNetwork } = useWallet();

  const handleSwitch = React.useCallback(
    async (nextNetwork: WalletNetwork) => {
      if (preferredNetwork === nextNetwork) {
        return;
      }

      const nextChain = nextNetwork === 'mainnet' ? '-239' : '-3';
      const needsReconnect = connected && chain !== nextChain;

      if (needsReconnect) {
        localStorage.removeItem('auth_token');
        notifyAuthChanged();
        await disconnect();
      }

      setPreferredNetwork(nextNetwork);

      toast.success(
        needsReconnect
          ? `Switched to ${nextNetwork}. Reconnect wallet on the new network.`
          : `Switched to ${nextNetwork}.`
      );
    },
    [chain, connected, disconnect, preferredNetwork, setPreferredNetwork]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card border-2 border-border hover:bg-muted font-display font-bold px-3">
          <Globe2 className="w-4 h-4" />
          <span className="hidden sm:inline">{preferredNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="font-display">Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSwitch('testnet')} className="cursor-pointer">
          Testnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleSwitch('mainnet')} className="cursor-pointer">
          Mainnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
