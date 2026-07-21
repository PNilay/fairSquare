import React from "react";
import { Wallet, Plus, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import ExportBar from "./ExportBar";
import ExpenseRow from "./ExpenseRow";
import { useCurrency } from "../context/CurrencyContext";
import type { ExpenseDTO, UserBalanceSummaryDTO } from "../data/types";
// import { EXPENSES, type Expense } from "../lib/data";
// import { computeBalances, getUser, getGroup } from "../lib/utils";

export default function DashboardView({
  onAddExpense,
  onGroupClick,
  // expenses,
  balanceSummary,
}: {
  onAddExpense: () => void;
  onGroupClick: (id: number) => void;
  // expenses: ExpenseDTO[];
  balanceSummary: UserBalanceSummaryDTO;
}) {
  const { fmt } = useCurrency();
  const net = balanceSummary?.netBalance;
  const owed = balanceSummary?.totalOwedToYou;
  const iOwe = balanceSummary?.totalYouOwe;
  // const recent = [...expenses]
  //   .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
  //   .slice(0, 7);

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        {/* <ExportBar label="All Expenses" expenses={expenses} /> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Balance",
            value: net,
            Icon: Wallet,
            color: net >= 0 ? "text-emerald-400" : "text-[#f0365b]",
            sign: true,
          },
          {
            label: "You Are Owed",
            value: owed,
            Icon: TrendingUp,
            color: "text-emerald-400",
            sign: false,
          },
          {
            label: "You Owe",
            value: iOwe,
            Icon: TrendingDown,
            color: "text-[#f0365b]",
            sign: false,
          },
        ].map(({ label, value, Icon, color, sign }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2.5">
              <Icon size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${color}`}>
              {sign && value > 0 ? "+" : ""}
              {fmt(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={15} /> Add an Expense
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-bold hover:bg-accent transition-colors">
          <ArrowRightLeft size={15} /> Settle Up
        </button>
      </div>

      <div>
        <h2 className="text-sm font-bold text-foreground mb-4">Recent Activity</h2>
        {/* <div className="space-y-2.5">
          {recent.map((exp: ExpenseDTO) => (
            <button
              key={exp.id}
              onClick={() => exp.groupId && onGroupClick(exp.groupId)}
              className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl px-4 py-3.5 text-left hover:border-[rgba(0,200,150,0.25)] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base flex-shrink-0">
                * icon
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{exp.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exp.groupId
                    ? `${getGroup(exp.groupId)?.emoji} ${getGroup(exp.groupId)?.name}`
                    : "Direct"}{" "}
                  · {getUser(exp.paidById)?.name.split(" ")[0]} paid
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold font-mono text-foreground">{fmt(exp.amount)}</p>
              </div>
            </button>
          ))}
        </div> */}
      </div>
    </div>
  );
}
