import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import type { View } from "./data/constants";
import MainLayout from "./pages/MainLayout";
import DashboardView from "./components/DashboardView";
import GroupsView from "./components/GroupsView";
import AnalyticsView from "./components/AnalyticsView";
import ExpensesView from "./components/ExpensesView";
import FriendsView from "./components/FriendsView";

function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <>
      <MainLayout sidebar={<Sidebar currentView={view} onNavigate={(v) => setView(v)} />}>
        {/* Conditional View Router Mapping */}
        {view === "dashboard" && <DashboardView />}
        {view === "groups" && <GroupsView />}
        {view === "expenses" && <ExpensesView />}
        {view === "friends" && <FriendsView />}
        {view === "analytics" && <AnalyticsView />}
      </MainLayout>
    </>
  );
}

export default App;
