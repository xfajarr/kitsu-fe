import * as React from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { DensScreen } from "@/components/screens/DensScreen";
import { FoxChatScreen } from "@/components/screens/FoxChatScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { PROFILE, TOKENS } from "@/data/mock";

const Index = () => {
  const [tab, setTab] = React.useState<TabKey>("home");

  const portfolioUsd = React.useMemo(
    () => TOKENS.reduce((sum, t) => sum + t.balance * t.priceUsd, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md">
        <TopBar
          level={PROFILE.level}
          xp={PROFILE.xp}
          xpNext={PROFILE.xpNext}
          streak={PROFILE.streak}
          username={PROFILE.name}
        />
        <div key={tab}>
          {tab === "home" && (
            <HomeScreen
              portfolioUsd={portfolioUsd}
              dayChangePct={2.31}
              onNavigate={setTab}
            />
          )}
          {tab === "dens" && <DensScreen />}
          {tab === "fox" && <FoxChatScreen />}
          {tab === "profile" && <ProfileScreen />}
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
