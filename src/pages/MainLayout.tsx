import React from "react";

interface MainLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div
      className="min-h-screen bg-background flex"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* SideBar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-[#0e1520] fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Main Content Space */}
      <main className="flex-1 lg:ml-56 pb-24 lg:pb-8 border-amber-400">
        <div className="max-w-2xl mx-auto px-4 pt-20 lg:pt-10 lg:px-8 pb-8">{children}</div>
      </main>
    </div>
  );
}
