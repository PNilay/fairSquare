import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Avatar from "./Avatar";
import { useCurrency } from "../context/CurrencyContext";
import { fmtDate, getCatIcon } from "../utils/helper";
import { ME } from "../data/constants";
import type { ExpenseDTO, RelatedUserDTO, SimplifiedGroups } from "../data/types";

export default function ExpenseRow({
  expense,
  friends,
  simplifiedGroup,
}: {
  expense: ExpenseDTO;
  meId: number;
  friends: RelatedUserDTO[];
  simplifiedGroup: SimplifiedGroups | null;
}) {
  const [open, setOpen] = useState(false);
  const { fmt } = useCurrency();

  const userShare = expense.splits.find((split) => split.userId == ME.id)?.amount ?? 0;
  const bal = expense.paidBy == ME.id ? expense.amount - userShare : -1 * userShare;

  useEffect(() => {
    console.log("expense Dta:");
    console.log(expense);
    console.log(friends);
  }, [expense]);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card hover:border-[rgba(0,200,150,0.2)] transition-colors">
      <button
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">
          {getCatIcon(expense.category)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{expense.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {expense.paidBy === ME.id
              ? "You paid"
              : `${friends.find((member) => member.id == expense.paidBy)?.name.split(" ")[0]} paid`}
            {simplifiedGroup ? ` · ${simplifiedGroup.icon} ${simplifiedGroup.name}` : " · Direct"}
            {" · "}
            {fmtDate(expense.expenseDate)}
          </p>
        </div>
        <div className="text-right shrink-0 mr-1">
          <p className="text-sm font-bold font-mono text-foreground">{fmt(expense.amount)}</p>
          {bal !== 0 && (
            <p
              className={`text-xs font-mono mt-0.5 ${bal > 0 ? "text-emerald-400" : "text-[#f0365b]"}`}
            >
              {bal > 0 ? `+${fmt(bal)}` : fmt(bal)}
            </p>
          )}
          {bal === 0 && <p className="text-xs text-muted-foreground mt-0.5">settled</p>}
        </div>
        <div className="text-muted-foreground shrink-0">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border bg-[#0e1520] px-4 py-3.5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Split
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold tracking-wide">
              {expense.splitType}
            </span>
          </div>
          <div className="space-y-2">
            {expense.splits.map((s) => {
              const m = s.userId == ME.id ? ME : friends.find((member) => member.id == s.userId)!;
              return (
                <div key={s.userId} className="flex items-center gap-2.5">
                  <Avatar user={m} size="sm" />
                  <span className="text-xs text-foreground flex-1">
                    {m.id === ME.id ? "You" : m.name}
                  </span>
                  {expense.splitType === "PERCENTAGE" && (
                    <span className="text-xs text-muted-foreground font-mono">{s.percentage}%</span>
                  )}
                  <span className="text-xs font-mono font-bold text-foreground">
                    {fmt(s.amount ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
