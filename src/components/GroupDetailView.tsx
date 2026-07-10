import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { ArrowLeft, Plus } from "lucide-react";
import ExportBar from "./ExportBar";
import ExpenseRow from "./ExpenseRow";
import { ME, type View } from "../data/constants";
import type { ExpenseDTO, GroupSummaryDTO, RelatedUserDTO, SimplifiedGroups } from "../data/types";
import { expenseService } from "../services/expenseService";

interface PaginationState {
  startCursor: number | null;
  endCursor: number | null;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
}

function GroupDetailView({
  group,
  onAddExpense,
  onBack,
  friends,
}: {
  group: GroupSummaryDTO;
  friends: RelatedUserDTO[];
  onAddExpense: () => void;
  onBack: (view: View) => void;
}) {
  const { fmt } = { fmt: (n: number) => `$${n.toFixed(2)}` } as any;
  const members = group.members;

  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    startCursor: null,
    endCursor: null,
    hasMoreOlder: false,
    hasMoreNewer: false,
  });

  // 1. Initial Load
  const fetchInitialExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpensesForGroup(ME.id, group.id);
      setExpenses(data.content || []);
      setPagination({
        startCursor: data.startCursor,
        endCursor: data.endCursor,
        hasMoreOlder: data.hasMoreOlder,
        hasMoreNewer: data.hasMoreNewer,
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // 2. Scroll Down (Load Older Items)
  const loadOlderExpenses = async () => {
    if (!pagination.hasMoreOlder || loading) return;
    setLoading(true);
    try {
      const data = await expenseService.getExpensesForGroup(
        ME.id,
        group.id,
        pagination.endCursor,
        null,
        20,
      );

      // Append older items to the bottom of the array
      setExpenses((prev) => [...prev, ...(data.content || [])]);
      setPagination((prev) => ({
        ...prev,
        endCursor: data.endCursor,
        hasMoreOlder: data.hasMoreOlder,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Scroll Up / Pull to Refresh (Load Newer Items)
  const loadNewerExpenses = async () => {
    if (!pagination.hasMoreNewer || loading) return;
    setLoading(true);
    try {
      const data = await expenseService.getExpensesForGroup(
        ME.id,
        group.id,
        null,
        pagination.startCursor,
        20,
      );

      // Prepend newer items to the top of your layout array
      setExpenses((prev) => [...(data.content || []), ...prev]);
      setPagination((prev) => ({
        ...prev,
        startCursor: data.startCursor,
        hasMoreNewer: data.hasMoreNewer,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (group.id) {
      fetchInitialExpenses();
    }
  }, [group.id]);

  const groupInfo: SimplifiedGroups = {
    id: group.id,
    name: group.name,
    icon: group.icon,
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => onBack("groups")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft size={15} /> Back to Groups
      </button>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
                {group.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{members.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ExportBar label={group.name} expenses={expenses} />
              <button
                onClick={onAddExpense}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border flex-wrap">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <Avatar user={m} size="sm" />
                <span className="text-xs text-muted-foreground font-semibold">
                  {m.id === ME.id ? "You" : m.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`px-6 py-4 border-t border-border ${group.currentUserBalance.status === "OWES" ? "bg-emerald-500/5" : group.currentUserBalance.status === "OWED" ? "bg-[#f0365b]/5" : ""}`}
        >
          <p
            className={`text-xl font-bold font-mono ${group.currentUserBalance.status === "OWES" ? "text-emerald-400" : group.currentUserBalance.status === "OWED" ? "text-[#f0365b]" : "text-muted-foreground"}`}
          >
            {group.currentUserBalance.status === "OWES"
              ? `You are owed ${fmt(group.currentUserBalance.amount)}`
              : group.currentUserBalance.status === "OWED"
                ? `You owe ${fmt(Math.abs(group.currentUserBalance.amount))}`
                : "Settled up ✓"}
          </p>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4">
          Expenses <span className="text-muted-foreground font-normal">({group.expenseCount})</span>
        </h2>
        <div className="space-y-2.5">
          {expenses.map((exp) => (
            <ExpenseRow
              key={exp.id}
              expense={exp}
              meId={ME.id}
              simplifiedGroup={groupInfo}
              friends={friends}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupDetailView;
