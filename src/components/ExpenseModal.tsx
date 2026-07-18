import React, { useMemo, useState } from "react";
import { X, Search, CheckCircle2, AlertCircle } from "lucide-react";
import Avatar from "./Avatar";
import { useCurrency } from "../context/CurrencyContext";
import { expenseService } from "../services/expenseService";
import {
  CATEGORIES,
  type CreateExpenseRequest,
  type ExpenseDTO,
  type ExpenseCategory,
  type GroupMember,
  type GroupSummaryDTO,
  type PopulatedGroup,
  type RelatedUserDTO,
  type SimplifiedGroups,
  type SplitStrategy,
  type User,
  type UserDTO,
} from "../data/types";
import { CURRENCIES, ME } from "../data/constants";

function fmtOriginal(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount);
}

export default function ExpenseModal({
  onClose,
  initialGroupId,
  group,
  groups,
  friends,
  onExpenseCreated,
}: {
  onClose: () => void;
  initialGroupId?: number;
  group: GroupSummaryDTO;
  groups: GroupSummaryDTO[];
  friends: RelatedUserDTO[];
  onExpenseCreated?: (expense: ExpenseDTO) => void;
}) {
  const { fmt } = useCurrency();

  const [ctx, setCtx] = useState<"group" | "friend">("group");

  const [groupId, setGroupId] = useState<number | null>(initialGroupId ?? groups[0]?.id ?? "");

  const [expCurrency, setExpCurrency] = useState("USD");
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [paidById, setPaidById] = useState<number>(ME.id);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("FOOD");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [strategy, setStrategy] = useState<SplitStrategy>("EQUAL");
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [pcts, setPcts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  const members = useMemo<GroupMember[] | RelatedUserDTO[]>(() => {
    if (ctx === "group") {
      const g = groups.find((g) => g.id === groupId);
      return (g?.members ?? []) as GroupMember[];
    }

    const selectedMembers = selectedFriendIds
      .map((id) => friends.find((f) => f.id === id))
      .filter((f): f is RelatedUserDTO => !!f);

    return [ME, ...selectedMembers] as RelatedUserDTO[];
  }, [ctx, groupId, selectedFriendIds, groups]);

  const total = parseFloat(amount) || 0;
  const expRate = CURRENCIES.find((c) => c.code === expCurrency)?.rate ?? 1;
  const usdEquiv = expCurrency !== "USD" && total > 0 ? total / expRate : null;
  const baseAmount = usdEquiv ?? total;
  const equalShare = members.length > 0 ? baseAmount / members.length : 0;
  const exactSum = Object.values(exactAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const pctSum = Object.values(pcts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const exactOk = baseAmount > 0 && Math.abs(exactSum - baseAmount) < 0.01;
  const pctOk = Math.abs(pctSum - 100) < 0.01;

  const toggleFriend = (id: number) =>
    setSelectedFriendIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleSaveExpense = async () => {
    setSaveError(null);

    if (ctx === "group" && (groupId === null || groupId === undefined)) {
      setSaveError("Please select a group.");
      return;
    }

    if (total <= 0) {
      setSaveError("Enter a valid expense amount.");
      return;
    }

    if (ctx === "friend" && selectedFriendIds.length === 0) {
      setSaveError("Select at least one friend to split with.");
      return;
    }

    if (strategy === "EXACT" && !exactOk) {
      setSaveError("Exact split values must match the total amount.");
      return;
    }

    if (strategy === "PERCENTAGE" && !pctOk) {
      setSaveError("Percentage shares must total 100%.");
      return;
    }

    const expenseAmount = Number(total.toFixed(2));
    const expenseDateISO = new Date(date).toISOString();

    const splits = members.map((member) => {
      const memberId = member.id.toString();
      let amountValue = 0;
      let percentageValue = 0;

      if (strategy === "EQUAL") {
        amountValue = expenseAmount / members.length;
        percentageValue = 100 / members.length;
      } else if (strategy === "EXACT") {
        amountValue = parseFloat(exactAmounts[memberId] ?? "0");
        percentageValue = expenseAmount > 0 ? (amountValue / expenseAmount) * 100 : 0;
      } else if (strategy === "PERCENTAGE") {
        percentageValue = parseFloat(pcts[memberId] ?? "0");
        amountValue = expenseAmount * (percentageValue / 100);
      }

      return {
        userId: member.id,
        amount: Number(amountValue.toFixed(2)),
        percentage: Number(percentageValue.toFixed(2)),
        share: Number(amountValue.toFixed(2)),
      };
    });

    const request: CreateExpenseRequest = {
      groupId: ctx === "group" ? groupId : null,
      paidBy: paidById,
      amount: expenseAmount,
      description: description || "",
      category,
      currency: expCurrency,
      notes,
      expenseDate: expenseDateISO,
      splitType: strategy,
      splits,
    };

    try {
      setSaving(true);
      const createdExpense = await expenseService.createExpense(request);
      onExpenseCreated?.(createdExpense);
      onClose();
    } catch (error: any) {
      setSaveError(error?.message ?? "Failed to save expense. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const iCls =
    "w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";
  const curSymbol = CURRENCIES.find((c) => c.code === expCurrency)?.symbol ?? "$";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Add Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Context toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            {(["group", "friend"] as const).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCtx(c);
                  setPaidById(ME.id);
                  setSelectedFriendIds([]);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${ctx === c ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c === "group" ? "🏠 Split with Group" : "👤 Split with Friend"}
              </button>
            ))}
          </div>

          {/* Group or Friend selection */}
          {ctx === "group" ? (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Group
              </label>
              <select
                value={groupId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setGroupId(value ? Number(value) : null);
                  setPaidById(ME.id);
                }}
                className={iCls}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Select Friends{" "}
                {selectedFriendIds.length > 0 && (
                  <span className="text-primary normal-case tracking-normal font-semibold ml-1">
                    {selectedFriendIds.length} selected{" "}
                    <span className="text-[10px] opacity-70">· groupId = null</span>
                  </span>
                )}
              </label>
              <div className="relative mb-2">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search friends…"
                  className={`${iCls} pl-8`}
                />
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {filteredFriends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleFriend(f.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${selectedFriendIds.includes(f.id) ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-foreground hover:bg-accent border border-transparent"}`}
                  >
                    <Avatar user={f} size="sm" />
                    <span className="font-semibold flex-1 text-left">{f.name}</span>
                    {selectedFriendIds.includes(f.id) && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Nobu"
              className={iCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details about the expense"
              className={`${iCls} min-h-[5rem] resize-none`}
            />
          </div>

          {/* Amount + Expense Currency + Category */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Expense Currency
                </label>
                <select
                  value={expCurrency}
                  onChange={(e) => setExpCurrency(e.target.value)}
                  className={iCls}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                    {curSymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${iCls} pl-7 font-mono`}
                  />
                </div>
              </div>
            </div>
            {usdEquiv !== null && total > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <span className="text-amber-400 text-xs">🔄</span>
                <span className="text-xs text-amber-300 font-mono">
                  {fmtOriginal(total, expCurrency)} ≈{" "}
                  <span className="font-bold">{fmt(usdEquiv)}</span> USD — used for split
                  calculations
                </span>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className={iCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Paid By + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Paid By
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(Number(e.target.value))}
                className={iCls}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id === ME.id ? "You" : m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={iCls}
              />
            </div>
          </div>

          {/* Split Strategy */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Split Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["EQUAL", "EXACT", "PERCENTAGE"] as SplitStrategy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${strategy === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:text-foreground border border-border"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          {members.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Breakdown{" "}
                  {expCurrency !== "USD" && (
                    <span className="text-amber-400 normal-case tracking-normal font-semibold">
                      (in {expCurrency !== "USD" ? `USD, paid in ${expCurrency}` : "USD"})
                    </span>
                  )}
                </label>
                {strategy === "EXACT" && baseAmount > 0 && (
                  <div
                    className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full ${exactOk ? "bg-emerald-500/15 text-emerald-400" : "bg-[#f0365b]/15 text-[#f0365b]"}`}
                  >
                    {exactOk ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{" "}
                    {fmt(exactSum)} / {fmt(baseAmount)}
                  </div>
                )}
                {strategy === "PERCENTAGE" && (
                  <div
                    className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full ${pctOk ? "bg-emerald-500/15 text-emerald-400" : "bg-[#f0365b]/15 text-[#f0365b]"}`}
                  >
                    {pctOk ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{" "}
                    {pctSum.toFixed(1)}% / 100%
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 bg-muted rounded-xl px-3 py-2.5"
                  >
                    <Avatar user={member} size="sm" />
                    <span className="text-sm font-semibold text-foreground flex-1">
                      {member.id === ME.id ? "You" : member.name.split(" ")[0]}
                    </span>
                    {strategy === "EQUAL" && (
                      <div className="text-right">
                        {usdEquiv && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {fmtOriginal(total / members.length, expCurrency)}
                          </p>
                        )}
                        <span className="text-sm font-mono font-bold text-primary">
                          {baseAmount > 0 ? fmt(equalShare) : "—"}
                        </span>
                      </div>
                    )}
                    {strategy === "EXACT" && (
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={exactAmounts[member.id] ?? ""}
                          onChange={(e) =>
                            setExactAmounts((p) => ({ ...p, [member.id]: e.target.value }))
                          }
                          placeholder="0.00"
                          className="w-full bg-background border border-border rounded-lg pl-5 pr-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-right"
                        />
                      </div>
                    )}
                    {strategy === "PERCENTAGE" && (
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={pcts[member.id] ?? ""}
                          onChange={(e) => setPcts((p) => ({ ...p, [member.id]: e.target.value }))}
                          placeholder="0"
                          className="w-full bg-background border border-border rounded-lg px-2 pr-6 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-right"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                          %
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {strategy === "EXACT" && baseAmount > 0 && !exactOk && exactSum > 0 && (
                <div className="flex items-center gap-2 mt-2 text-[#f0365b] text-xs bg-[#f0365b]/10 border border-[#f0365b]/20 rounded-xl px-3 py-2">
                  <AlertCircle size={12} className="shrink-0" />
                  {exactSum < baseAmount
                    ? `${fmt(baseAmount - exactSum)} unallocated`
                    : `Over by ${fmt(exactSum - baseAmount)}`}
                </div>
              )}
              {strategy === "PERCENTAGE" && !pctOk && pctSum > 0 && (
                <div className="flex items-center gap-2 mt-2 text-[#f0365b] text-xs bg-[#f0365b]/10 border border-[#f0365b]/20 rounded-xl px-3 py-2">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  {pctSum < 100
                    ? `${(100 - pctSum).toFixed(1)}% remaining`
                    : `Over by ${(pctSum - 100).toFixed(1)}%`}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0 flex-col sm:flex-row">
          <div className="flex-1">
            {saveError && (
              <div className="rounded-xl border border-[#f0365b]/20 bg-[#f0365b]/10 px-3 py-2 text-sm text-[#f0365b]">
                {saveError}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveExpense}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
