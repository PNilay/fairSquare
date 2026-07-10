import React, { useMemo, useState } from "react";
import { X, Search, CheckCircle2, AlertCircle } from "lucide-react";
import Avatar from "./Avatar";
import { useCurrency } from "../context/CurrencyContext";
import {
  CATEGORIES,
  type GroupSummaryDTO,
  type PopulatedGroup,
  type RelatedUserDTO,
  type UserDTO,
} from "../data/types";
import { ME } from "../data/constants";

export default function ExpenseModal({
  onClose,
  initialGroupId,
  group,
  friends,
}: {
  onClose: () => void;
  initialGroupId?: number;
  group: GroupSummaryDTO;
  friends: RelatedUserDTO[];
}) {
  const { fmt } = useCurrency();
  const [ctx, setCtx] = useState<"group" | "friend">("group");
  const [groupId, setGroupId] = useState(initialGroupId ?? group?.id);
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [paidById, setPaidById] = useState(ME.id);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [strategy, setStrategy] = useState<"EQUAL" | "EXACT" | "PERCENTAGE">("EQUAL");
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [pcts, setPcts] = useState<Record<string, string>>({});

  //   const friends = USERS.filter((u) => u.id !== ME.id);
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  const members = friends;

  //   useMemo(() => {
  //     if (ctx === "group") {
  //       const g = getGroup(groupId);
  //       return (g?.memberIds ?? []).map((id) => USERS.find((u) => u.id === id)!).filter(Boolean);
  //     }
  //     return [ME, ...selectedFriendIds.map((id) => USERS.find((u) => u.id === id)!).filter(Boolean)];
  //   }, [ctx, groupId, selectedFriendIds]);

  const total = parseFloat(amount) || 0;
  const equalShare = members.length > 0 ? total / members.length : 0;
  const exactSum = Object.values(exactAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const pctSum = Object.values(pcts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const exactOk = total > 0 && Math.abs(exactSum - total) < 0.01;
  const pctOk = Math.abs(pctSum - 100) < 0.01;

  const toggleFriend = (id: number) =>
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const iCls =
    "w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

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

          {ctx === "group" ? (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Group
              </label>
              {/* <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  setPaidById(ME.id);
                }}
                className={iCls}
              >
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.emoji} {g.name}
                  </option>
                ))}
              </select> */}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Select Friends
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
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
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

          {/* Amount + Category simplified */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                  $
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
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={iCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}
