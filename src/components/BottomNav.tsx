import { BarChart2, Briefcase, Newspaper, BookOpen, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "analyze", label: "분석", Icon: BarChart2 },
  { id: "portfolio", label: "포트폴리오", Icon: Briefcase },
  { id: "news", label: "뉴스", Icon: Newspaper },
  { id: "rules", label: "투자규칙", Icon: BookOpen },
  { id: "settings", label: "설정", Icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-around px-1 py-1 max-w-md mx-auto">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 flex-1"
              style={{
                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                background: isActive ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
