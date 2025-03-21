
import { useState } from "react";
import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Copy, Share2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
  invite_code?: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Get user and fetch groups
  useEffect(() => {
    const fetchUserAndGroups = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          fetchGroups(user.id);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load your account information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndGroups();
  }, []);

  const fetchGroups = async (uid: string) => {
    try {
      // Fetch groups where the user is a member
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id, 
          name, 
          invite_code,
          group_members!inner(user_id)
        `)
        .eq('group_members.user_id', uid);
      
      if (error) throw error;
      
      if (data) {
        // Fetch members for each group
        const groupsWithMembers = await Promise.all(data.map(async (group) => {
          const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select(`
              user_id,
              profiles(name, avatar_url)
            `)
            .eq('group_id', group.id);
          
          if (membersError) throw membersError;
          
          // Calculate progress for each member
          const membersWithProgress = await Promise.all((members || []).map(async (member) => {
            const progress = await calculateMemberProgress(member.user_id);
            return {
              id: member.user_id,
              name: member.profiles?.name || 'Anonymous',
              avatar: member.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${member.user_id}`,
              progress
            };
          }));
          
          return {
            id: group.id,
            name: group.name,
            invite_code: group.invite_code,
            members: membersWithProgress
          };
        }));
        
        setGroups(groupsWithMembers);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load your groups');
    }
  };

  const calculateMemberProgress = async (memberId: string) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get prayer data for current month
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', memberId)
        .eq('month', currentMonth)
        .eq('year', currentYear);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const currentDay = currentDate.getDate();
      let totalPrayers = 0;
      let completedPrayers = 0;
      
      data.forEach(prayer => {
        if (prayer.day <= currentDay) {
          totalPrayers += 5; // 5 prayers per day
          if (prayer.fajr) completedPrayers++;
          if (prayer.zuhr) completedPrayers++;
          if (prayer.asr) completedPrayers++;
          if (prayer.maghrib) completedPrayers++;
          if (prayer.isha) completedPrayers++;
        }
      });
      
      return totalPrayers > 0 ? Math.round((completedPrayers / totalPrayers) * 100) : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !userId) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      // Insert new group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name: newGroupName, created_by: userId, invite_code: inviteCode }])
        .select();
      
      if (groupError) throw groupError;
      
      if (groupData && groupData.length > 0) {
        const newGroupId = groupData[0].id;
        
        // Add creator as a member
        const { error: memberError } = await supabase
          .from('group_members')
          .insert([{ group_id: newGroupId, user_id: userId, role: 'admin' }]);
        
        if (memberError) throw memberError;
        
        // Create invite URL
        const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
        setInviteUrl(inviteUrl);
        setShowInviteDialog(true);
        
        // Refresh groups
        fetchGroups(userId);
      }
      
      setNewGroupName("");
      setIsCreateGroupOpen(false);
      toast.success(`New group "${newGroupName}" created!`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  const handleAddMember = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.invite_code) return;
    
    const inviteUrl = `${window.location.origin}/invite/${group.invite_code}`;
    setInviteUrl(inviteUrl);
    setShowInviteDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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

        {groups.length === 0 ? (
          <div className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow border border-primary/10 dark:border-slate-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Groups Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first prayer group to get started!</p>
            <Button onClick={() => setIsCreateGroupOpen(true)} className="bg-primary">
              Create a Group
            </Button>
          </div>
        ) : (
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
        )}

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

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Share Invite Link</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share this link with friends to invite them to your group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Input
                className="dark:bg-slate-700 dark:border-slate-600"
                value={inviteUrl}
                readOnly
              />
              <Button size="icon" onClick={handleCopyInvite}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInviteDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
