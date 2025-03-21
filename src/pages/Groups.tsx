
import { useState } from "react";
import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Initial mock data
const initialMembers = [
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
  const [groups, setGroups] = useState([{ id: "1", name: "Morning Prayer Warriors", members: [...initialMembers] }]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    const newGroup = {
      id: `g-${Date.now()}`,
      name: newGroupName,
      members: []
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setIsCreateGroupOpen(false);
    toast.success(`New group "${newGroupName}" created!`);
  };

  const handleAddMember = (groupId: string) => {
    // Find the group to add member to
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) return;
    
    // Create a random member for demo purposes
    const names = ["Fatima", "Omar", "Layla", "Ibrahim", "Noor"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newMember = {
      id: `m-${Date.now()}`,
      name: randomName,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      progress: Math.floor(Math.random() * 100)
    };
    
    // Add member to the group
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members.push(newMember);
    setGroups(updatedGroups);
    
    toast.success(`${randomName} added to ${groups[groupIndex].name}`);
  };

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
          <Button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Create New Group
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <GroupCard 
              key={group.id}
              groupId={group.id} 
              members={group.members} 
              onAddMember={() => handleAddMember(group.id)} 
            />
          ))}
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

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Create New Prayer Group</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Enter a name for your new prayer group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              className="dark:bg-slate-700 dark:border-slate-600"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
