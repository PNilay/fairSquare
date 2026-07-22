import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { ME, type View } from "./data/constants";
import MainLayout from "./pages/MainLayout";
import DashboardView from "./components/DashboardView";
import GroupsView from "./components/GroupsView";
import AnalyticsView from "./components/AnalyticsView";
import ExpensesView from "./components/ExpensesView";
import FriendsView from "./components/FriendsView";
import GroupDetailView from "./components/GroupDetailView";
import ExpenseModal from "./components/ExpenseModal";
import type {
  UserBalanceSummaryDTO,
  RelatedUserDTO,
  GroupSummaryDTO,
  GroupInfo,
  SimplifiedGroups,
} from "./data/types";
import { groupService } from "./services/groupService";
import { expenseService } from "./services/expenseService";
import { userService } from "./services/userService";
import FriendDetailView from "./components/FriendDetailView";
import CreateEditGroupView from "./components/CreateEditGroupView";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState("expense");
  const [addEditGroup, setAddEditGroup] = useState<"create" | "edit">("create");
  const [balanceSummary, setBalanceSummary] = useState<UserBalanceSummaryDTO | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<RelatedUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<RelatedUserDTO[]>([]);
  const [error, setError] = useState(true);

  const [groupData, setGroupData] = useState<GroupSummaryDTO[]>([]);
  const [simplifiedGroups, setSimplifiedGroups] = useState<SimplifiedGroups[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        const groupSummaries = await groupService.fetchGroupSummaries(ME.id);
        setGroupData(groupSummaries);

        const balanceSummary = await expenseService.getGlobalBalanceSummary(1);
        const getFriends = await userService.getFriends(1);
        setBalanceSummary(balanceSummary);
        setFriends(getFriends);
      } catch (error: any) {
        setError(error);
        console.log("Error:: " + error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    console.log("Group Dta:");
    console.log(groupData);
    const g = groupData.map((group) => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
    }));
    setSimplifiedGroups(g);
  }, [groupData]);

  function handleGroupClick(id: number): void {
    setSelectedGroupId(id);
    setView("group-detail");
  }

  function handleCreateEditGroupClick(id: number | null, type: "create" | "edit"): void {
    setShowModal(true);
    setForm("group");
    setAddEditGroup(type);
  }

  const handleFriendClick = (friend: RelatedUserDTO) => {
    setSelectedFriend(friend);
    setView("friend-detail");
  };

  function handleOnAddExpenseClick(): void {
    setShowModal(true);
  }

  function handleBackTo(prev: View): void {
    setView(prev);
  }

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <MainLayout
        sidebar={
          <Sidebar
            currentView={view}
            onNavigate={(v) => setView(v)}
            onAddExpense={() => setShowModal(true)}
          />
        }
      >
        {/* Conditional View Router Mapping */}
        {view === "dashboard" && (
          <DashboardView
            onAddExpense={handleOnAddExpenseClick}
            onGroupClick={handleGroupClick}
            balanceSummary={balanceSummary!}
          />
        )}
        {view === "groups" && (
          <GroupsView
            onGroupClick={handleGroupClick}
            groups={groupData}
            loading={loading}
            onAddGroupClick={handleCreateEditGroupClick}
          />
        )}
        {view === "group-detail" && selectedGroupId && (
          <GroupDetailView
            onAddExpense={handleOnAddExpenseClick}
            group={groupData.find((g) => g.id === selectedGroupId)!}
            onBack={handleBackTo}
            friends={friends}
          />
        )}
        {view === "expenses" && (
          <ExpensesView friends={friends} simplifiedGroups={simplifiedGroups} />
        )}
        {view === "friends" && (
          <FriendsView friends={friends} groups={groupData} onFriendClick={handleFriendClick} />
        )}
        {view === "friend-detail" && selectedFriend && (
          <FriendDetailView
            friend={selectedFriend}
            groups={groupData}
            // onAddExpense={handleOnAddExpenseClick}
            // group={groups.find((g) => g.id === selectedGroupId)!}
            onBack={handleBackTo}
          />
        )}
        {view === "analytics" && <AnalyticsView />}
      </MainLayout>

      {showModal && (
        <>
          {form === "expense" && (
            <ExpenseModal
              onClose={() => setShowModal(false)}
              initialGroupId={selectedGroupId ?? undefined}
              group={groupData.find((g) => g.id === selectedGroupId)!}
              groups={groupData}
              friends={friends}
            />
          )}

          {form === "group" && (
            <CreateEditGroupView
              onClose={() => setShowModal(false)}
              mode={addEditGroup}
              friends={friends}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;
