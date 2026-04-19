import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TonConnectProvider } from "@/providers/TonConnectProvider";
import { WalletNetworkProvider } from "@/providers/WalletNetworkProvider";
import { WalletAuthSync } from "@/components/WalletAuthSync";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletNetworkProvider>
      <TonConnectProvider>
        <WalletAuthSync />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TonConnectProvider>
    </WalletNetworkProvider>
  </QueryClientProvider>
);

export default App;
