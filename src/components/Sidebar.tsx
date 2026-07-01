import { ArrowRightLeft, Plus } from "lucide-react";
import { ME, NAV_ITEMS, type View } from "../data/constants";
import Avatar from "./Avatar";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onAddExpense: () => void;
}

export default function Sidebar({ currentView, onNavigate, onAddExpense }: SidebarProps) {
  const activeNav = currentView;

  return (
    <>
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <ArrowRightLeft size={14} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground tracking-tight">FairShare</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} /> {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-2.5">
        {/* <CurrencySelector /> */}
        <button
          onClick={onAddExpense}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
        >
          <Plus size={15} /> Add Expense
        </button>
      </div>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar user={ME} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{ME.name}</p>
            <p className="text-xs text-muted-foreground">{ME.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}
