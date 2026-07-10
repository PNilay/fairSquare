import { useEffect, useState } from "react";
import { ME } from "../data/constants";
import { expenseService } from "../services/expenseService";
import ExpenseRow from "./ExpenseRow";
import type { ExpensePageDTO, RelatedUserDTO, SimplifiedGroups } from "../data/types";

function ExpensesView({
  friends,
  simplifiedGroups,
}: {
  friends: RelatedUserDTO[];
  simplifiedGroups: SimplifiedGroups[];
}) {
  const [expensesData, setExpensesData] = useState<ExpensePageDTO | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const LIMIT = 10;

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const result = await expenseService.getExpensesForUser(ME.id, page, LIMIT);
        setExpensesData(result);
      } catch (err) {
        console.error("Failed to load expenses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [ME.id, page]); // Re-runs every time userId or page variables change

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            All
          </p>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        </div>
        {/* <ExportBar label="All Expenses" expenses={expensesData?.content} /> */}
      </div>
      <div className="space-y-2.5">
        {expensesData?.content.map((exp) => (
          <ExpenseRow
            key={exp.id}
            expense={exp}
            meId={ME.id}
            friends={friends}
            simplifiedGroup={
              exp.groupId
                ? (simplifiedGroups.find((group) => group.id == exp.groupId) ?? null)
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}

export default ExpensesView;
