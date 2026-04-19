import * as React from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { GoalsScreen } from "@/components/screens/GoalsScreen";
import { NestScreen } from "@/components/screens/NestScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { useUser } from "@/hooks/queries";
import { useWallet } from "@/hooks/useWallet";

const Index = () => {
  const [tab, setTab] = React.useState<TabKey>("home");
  const { address, connected } = useWallet();
  const { data: user, isLoading: userLoading } = useUser();

  const xpNext = user ? Math.floor(100 * Math.pow(1.5, user.level - 1)) : 100;
  const xpInCurrentLevel = user ? user.xp % xpNext : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md">
        <TopBar
          level={user?.level || 1}
          xp={user?.xp || 0}
          xpNext={xpNext}
          streak={user?.streakDays || 0}
          username={user?.username || (connected ? "FoxSaver" : "Guest")}
        />
        <div key={tab}>
          {tab === "home" && (
            <HomeScreen
              onNavigate={setTab}
            />
          )}
          {tab === "goals" && <GoalsScreen />}
          {tab === "nest" && <NestScreen />}
          {tab === "profile" && <ProfileScreen />}
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
