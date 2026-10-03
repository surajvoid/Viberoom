import { Home, Search, Library, Users } from 'lucide-react';

export type TabType = 'home' | 'search' | 'library' | 'friends';

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={19} /> },
    { id: 'search', label: 'Search', icon: <Search size={19} /> },
    { id: 'library', label: 'Library', icon: <Library size={19} /> },
    { id: 'friends', label: 'Social', icon: <Users size={19} /> },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md bg-background/95 backdrop-blur-lg border-t border-border-subtle z-30 select-none pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[54px] h-full transition-colors relative ${
                isActive ? 'text-content-primary' : 'text-content-muted hover:text-content-secondary'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-content-primary" />
                )}
              </div>
              <span className="text-[10px] font-sans tracking-wide mt-1 uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
