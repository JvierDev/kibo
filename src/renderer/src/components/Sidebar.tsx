import { Home, BarChart3, Settings, Info, Heart } from "lucide-react";
import type { AppRoute } from "../../../shared/types";
import { KiboMascot } from "./KiboMascot";

export type Route = AppRoute;

const NAV_ITEMS: { id: Route; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "about", label: "About", icon: Info },
];

interface SidebarProps {
  route: Route;
  onNavigate: (route: Route) => void;
}

export function Sidebar({
  route,
  onNavigate,
}: SidebarProps): React.JSX.Element {
  const navigate = (id: Route): void => {
    window.location.hash = `/${id}`;
    onNavigate(id);
  };

  return (
    <aside className="flex w-55 shrink-0 flex-col border-r border-(--border) bg-(--bg-secondary)">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="h-10 w-10 shrink-0">
          <KiboMascot state="idle" static />
        </div>
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight text-(--text-primary)">
            Kibo
          </div>
          <div className="text-[11px] text-(--text-muted)">
            Your healthy-work companion
          </div>
        </div>
      </div>

      <nav className="app-region-no-drag mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = id === route;
          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              aria-current={active ? "page" : undefined}
              className={`btn-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[rgba(32,213,221,0.14)] text-(--text-primary)"
                  : "text-(--text-muted) hover:bg-(--surface-hover) hover:text-(--text-secondary)"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-(--accent-cyan)" : ""}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mx-5 mb-5 rounded-xl border border-(--border) bg-(--surface) px-4 py-3">
        <p className="text-xs font-medium leading-snug text-(--text-secondary)">
          Better habits.
          <br />A healthier you.
        </p>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-(--accent-coral)">
          <Heart size={12} className="fill-current" />
          <span className="text-(--text-muted)">made with care</span>
        </div>
      </div>
    </aside>
  );
}
