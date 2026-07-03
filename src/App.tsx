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
  PopulatedGroup,
  GroupDTO,
  UserDTO,
  ExpenseDTO,
  UserBalanceSummaryDTO,
  RelatedUserDTO,
  GroupSummaryDTO,
} from "./data/types";
import { groupService } from "./services/groupService";
import { expenseService } from "./services/expenseService";
import { userService } from "./services/userService";
import FriendDetailView from "./components/FriendDetailView";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [balanceSummary, setBalanceSummary] = useState<UserBalanceSummaryDTO | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<RelatedUserDTO | null>(null);
  const [groups, setGroups] = useState<PopulatedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<RelatedUserDTO[]>([]);
  const [error, setError] = useState(true);

  const [groupData, setGroupData] = useState<GroupSummaryDTO[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        const groupSummaries = await groupService.fetchGroupSummaries(ME.id);
        setGroupData(groupSummaries);

        const rawGroups = await groupService.getGroups();
        const balanceSummary = await expenseService.getGlobalBalanceSummary(1);
        const getFriends = await userService.getFriends(1);
        setBalanceSummary(balanceSummary);
        setFriends(getFriends);

        // const populatedGroupsData: PopulatedGroup[] = await Promise.all(
        //   rawGroups.map(async (group) => {
        //     try {
        //       // Concurrent execution utilizing clean domain-driven service definitions
        //       const [members, expenses] = await Promise.all([
        //         groupService.getMembers(group.id),
        //         // expenseService.getGroupExpenses(group.id),
        //       ]);

        //       // Compute aggregate metrics safely
        //       // const balance = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        //       return {
        //         ...group,
        //         members,
        //         expenses,
        //         balance,
        //       };
        //     } catch (err) {
        //       console.error(`Failed to load data details for group ${group.id}:`, err);
        //       return { ...group, members: [], expenses: [], balance: 0 };
        //     }
        //   }),
        // );

        // setGroups(populatedGroupsData);
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
  }, [groupData]);

  function handleGroupClick(id: number): void {
    setSelectedGroupId(id);
    setView("group-detail");
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
            expenses={groups.flatMap((group) =>
              group.expenses.map((expense) => ({
                ...expense,
              })),
            )}
          />
        )}
        {view === "groups" && (
          <GroupsView onGroupClick={handleGroupClick} groups={groupData} loading={loading} />
        )}
        {view === "group-detail" && selectedGroupId && (
          <GroupDetailView
            onAddExpense={handleOnAddExpenseClick}
            group={groupData.find((g) => g.id === selectedGroupId)!}
            onBack={handleBackTo}
          />
        )}
        {view === "expenses" && <ExpensesView />}
        {view === "friends" && (
          <FriendsView friends={friends} groups={groups} onFriendClick={handleFriendClick} />
        )}
        {view === "friend-detail" && selectedFriend && (
          <FriendDetailView
            friend={selectedFriend}
            // onAddExpense={handleOnAddExpenseClick}
            // group={groups.find((g) => g.id === selectedGroupId)!}
            onBack={handleBackTo}
          />
        )}
        {view === "analytics" && <AnalyticsView />}
      </MainLayout>

      {showModal && (
        <ExpenseModal
          onClose={() => setShowModal(false)}
          initialGroupId={selectedGroupId ?? undefined}
          group={groups.find((g) => g.id === selectedGroupId)!}
          friends={friends}
        />
      )}
    </>
  );
}

export default App;
