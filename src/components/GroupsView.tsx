import type { GroupSummaryDTO } from "../data/types";
import Avatar from "./Avatar";
import { Plus } from "lucide-react";

interface GroupsViewProps {
  onGroupClick: (id: number) => void;
  groups: GroupSummaryDTO[];
  loading: boolean;
}

const openCreate = () => {
  console.log("Create Groups");
};

export default function GroupsView({ onGroupClick, groups, loading }: GroupsViewProps) {
  const { fmt } = { fmt: (n: number) => `${n.toFixed(2)}` } as any; // delegated to parent via currency context in App
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Your
          </p>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={15} /> New Group
        </button>
      </div>

      <div className="space-y-3">
        {groups.map((g) => {
          const members = g.members;
          return (
            <button
              key={g.id}
              onClick={() => onGroupClick(g.id)}
              className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 text-left hover:border-[rgba(0,200,150,0.25)] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                {g.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{g.name}</p>
                <div className="flex items-center gap-1 mt-2">
                  {members.map((m) => (
                    <Avatar key={m.id} user={m} size="sm" />
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-mono font-bold ${g.currentUserBalance.status === "OWES" ? "text-emerald-400" : g.currentUserBalance.status === "OWED" ? "text-[#f0365b]" : "text-muted-foreground"}`}
                >
                  ${fmt(g.currentUserBalance.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{g.expenseCount} expenses</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
