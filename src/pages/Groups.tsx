import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const mockMembers = [
  {
    id: "1",
    name: "Ahmed Hassan",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    progress: 85,
  },
  {
    id: "2",
    name: "Sara Ahmed",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    progress: 92,
  },
  {
    id: "3",
    name: "Mohammad Ali",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    progress: 78,
  },
];

const Groups = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-primary/10 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Prayer Groups</h1>
            <div className="space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/tracking")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                My Tracking
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button className="bg-primary hover:bg-primary/90 text-white">Create New Group</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GroupCard members={mockMembers} onAddMember={() => {}} />
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/tracking")}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            Go to My Tracking
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Groups;