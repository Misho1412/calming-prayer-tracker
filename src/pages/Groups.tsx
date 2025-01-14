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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Prayer Groups</h1>
            <div className="space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/tracking")}
                className="text-gray-600 hover:text-gray-900"
              >
                My Tracking
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button className="bg-primary hover:bg-primary/90">Create New Group</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GroupCard members={mockMembers} onAddMember={() => {}} />
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/tracking")}
            className="bg-accent hover:bg-accent/90"
          >
            Go to My Tracking
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Groups;