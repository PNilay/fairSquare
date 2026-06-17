import { AVATAR_COLORS } from "../data/constants";
import type { User } from "../data/constants";

export default function Avatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div
      className={`${sz} ${AVATAR_COLORS[user.colorIdx % AVATAR_COLORS.length]} rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none`}
    >
      {user.initials}
    </div>
  );
}
