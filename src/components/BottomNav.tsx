import { BarChart2, Briefcase, Newspaper, BookOpen, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "analyze",   label: "분석",    Icon: BarChart2  },
  { id: "portfolio", label: "포트폴리오", Icon: Briefcase  },
  { id: "news",      label: "뉴스",    Icon: Newspaper  },
  { id: "rules",     label: "투자규칙", Icon: BookOpen   },
  { id: "settings",  label: "설정",    Icon: Settings   },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: "var(--background)",
        borderColor: "var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -1px 0 var(--border), 0 -4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-around w-full" style={{ height: "3.75rem" }}>
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 active:scale-95"
              style={{
                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: "2.5rem",
                  height: "1.75rem",
                  background: isActive
                    ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                    : "transparent",
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.7} />
              </div>
              <span
                className="transition-all duration-200"
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
