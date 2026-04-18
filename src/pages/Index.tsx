import * as React from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SwapScreen } from "@/components/screens/SwapScreen";
import { StakeScreen } from "@/components/screens/StakeScreen";
import { PoolsScreen } from "@/components/screens/PoolsScreen";
import { TOKENS } from "@/data/mock";

const Index = () => {
  const [tab, setTab] = React.useState<TabKey>("home");

  // Compute portfolio from mock balances
  const portfolioUsd = React.useMemo(
    () => TOKENS.reduce((sum, t) => sum + t.balance * t.priceUsd, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md">
        <TopBar level={7} xp={420} xpNext={750} streak={5} username="Alex" />
        <div key={tab}>
          {tab === "home" && (
            <HomeScreen
              portfolioUsd={portfolioUsd}
              dayChangePct={2.31}
              onNavigate={setTab}
            />
          )}
          {tab === "swap" && <SwapScreen />}
          {tab === "stake" && <StakeScreen />}
          {tab === "pools" && <PoolsScreen />}
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
