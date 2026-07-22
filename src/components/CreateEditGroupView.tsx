import React, { useEffect, useState } from "react";
import { X, UserMinus, Search, Plus, Mail } from "lucide-react";
import Avatar from "./Avatar";
import { ME } from "../data/constants";
import type { Group } from "../data/types";
import type { RelatedUserDTO } from "../data/types";
import { groupService } from "../services/groupService";

function CreateEditGroupView({
  mode,
  friends,
  group,
  onClose,
  onCreate,
  onUpdate,
}: {
  mode: "create" | "edit";
  group?: Group;
  friends: RelatedUserDTO[];
  onClose: () => void;
  onCreate?: (name: string, emoji: string, memberIds: string[]) => void;
  onUpdate?: (id: string, u: Partial<Omit<Group, "id">>) => void;
}) {
  const [name, setName] = useState(group?.name ?? "");
  const [emoji, setEmoji] = useState(group?.emoji ?? "🏠");
  const [memberIds, setMemberIds] = useState<string[]>(
    (group?.memberIds ?? []).filter((id) => id !== String(ME.id)),
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableToAdd = friends.filter(
    (u) =>
      u.id !== ME.id &&
      !memberIds.includes(String(u.id)) &&
      u.name.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const currentMembers = [
    ME,
    ...memberIds.map((id) => friends.find((u) => String(u.id) === id)!).filter(Boolean),
  ];

  const addMember = (id: string) => setMemberIds((p) => [...p, id]);
  const removeMember = (id: string) => setMemberIds((p) => p.filter((x) => x !== id));

  const EMOJI_OPTIONS = ["🏠", "✈️", "🍔", "🎉", "💼", "🚗", "🏖️", "📚", "🍹", "🎵"];

  const handleInvite = () => {
    if (inviteEmail.includes("@")) {
      setInviteSent(true);
      setTimeout(() => {
        setInviteSent(false);
        setInviteEmail("");
      }, 2500);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setError(null);
    setSaving(true);

    try {
      if (mode === "create") {
        // create group then add members
        const created = await groupService.createGroup({
          name: name.trim(),
          description: description,
          createdBy: ME.id,
          icon: emoji,
        });

        const toAdd = memberIds.map((id) => Number(id));
        await Promise.all(toAdd.map((uid) => groupService.addMember(created.id, { userId: uid })));

        onCreate?.(name.trim(), emoji, memberIds);
      } else if (mode === "edit" && group) {
        const gid = parseInt(group.id, 10);
        await groupService.updateGroup(gid, { name: name.trim(), createdBy: ME.id });

        const original = new Set((group.memberIds ?? []).map((id) => String(id)));
        const updated = new Set([String(ME.id), ...memberIds]);

        // add new members
        for (const id of Array.from(updated)) {
          if (!original.has(id)) {
            await groupService.addMember(gid, { userId: Number(id) });
          }
        }
        // remove members
        for (const id of Array.from(original)) {
          if (!updated.has(id)) {
            await groupService.removeMember(gid, Number(id));
          }
        }

        onUpdate?.(group.id, {
          name: name.trim(),
          emoji,
          memberIds: [String(ME.id), ...memberIds],
        });
      }

      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to save group");
    } finally {
      setSaving(false);
    }
  };
  const iCls =
    "w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">
            {mode === "create" ? "Create New Group" : "Edit Group"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Group Icon
            </label>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
                {emoji}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pick an emoji that represents your group. This appears in lists and headers.
              </p>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-muted ${emoji === e ? "bg-primary/20 ring-2 ring-primary/50 scale-110" : ""}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Group Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tokyo Trip 2026, NYC Apartment…"
              className={iCls}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Members{" "}
              <span className="ml-1 text-primary font-bold normal-case tracking-normal">
                {currentMembers.length}
              </span>
            </label>
            <div className="space-y-1.5">
              {currentMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-muted rounded-xl px-3 py-2.5">
                  <Avatar user={m} size="sm" />
                  <span className="text-sm font-semibold text-foreground flex-1">
                    {m.id === ME.id ? "You (admin)" : m.name}
                  </span>
                  {m.id !== ME.id && (
                    <button
                      onClick={() => removeMember(String(m.id))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-[#f0365b] hover:bg-[#f0365b]/10 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus size={13} />
                    </button>
                  )}
                  {m.id === ME.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Add Members
            </label>
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name…"
                className={`${iCls} pl-8`}
              />
            </div>
            {availableToAdd.length > 0 ? (
              <div className="space-y-1.5">
                {availableToAdd.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addMember(String(u.id))}
                    className="w-full flex items-center gap-3 bg-muted hover:bg-accent rounded-xl px-3 py-2.5 transition-colors"
                  >
                    <Avatar user={u} size="sm" />
                    <span className="text-sm font-semibold text-foreground flex-1 text-left">
                      {u.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-primary font-bold">
                      <Plus size={12} /> Add
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic px-1">
                All available users are in this group.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  placeholder="friend@email.com"
                  type="email"
                  className={`${iCls} pl-8`}
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={inviteSent}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${inviteSent ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"}`}
              >
                {inviteSent ? "✓ Sent!" : "Invite"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              They'll get an email invite to join FairShare and this group.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mode === "create" ? "Create Group" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default CreateEditGroupView;
