import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import AnalyzePage from "@/pages/AnalyzePage";
import PortfolioPage from "@/pages/PortfolioPage";
import NewsPage from "@/pages/NewsPage";
import RulesPage from "@/pages/RulesPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("analyze");

  const renderPage = () => {
    switch (activeTab) {
      case "analyze": return <AnalyzePage />;
      case "portfolio": return <PortfolioPage />;
      case "news": return <NewsPage />;
      case "rules": return <RulesPage />;
      case "settings": return <SettingsPage />;
      default: return <AnalyzePage />;
    }
  };

  return (
    <div
      className="relative w-full"
      style={{
        background: "var(--background)",
        fontFamily: "'Noto Sans KR', sans-serif",
        minHeight: "100dvh",
      }}
    >
      <div
        className="overflow-y-auto"
        style={{ minHeight: "100dvh", paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
