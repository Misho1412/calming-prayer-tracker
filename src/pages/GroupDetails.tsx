
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Trophy, Share2, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Prayer {
  fajr: boolean;
  zuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  monthlyProgress: number;
  weeklyProgress: number;
  achievements: string[];
  prayers: Record<string, Prayer>;
  isTopPerformer: boolean;
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: Member[];
}

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    fetchGroupDetails();
    
    // Check for achievements weekly
    const checkInterval = setInterval(() => {
      if (groupId) {
        checkForAchievements(groupId);
      }
    }, 86400000); // Check once a day
    
    return () => clearInterval(checkInterval);
  }, [groupId]);
  
  const fetchGroupDetails = async () => {
    if (!groupId) return;
    
    try {
      // Get group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, invite_code')
        .eq('id', groupId)
        .single();
      
      if (groupError) throw groupError;
      
      if (!groupData) {
        toast.error("Group not found");
        navigate("/groups");
        return;
      }
      
      // Get members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles(name, avatar_url)
        `)
        .eq('group_id', groupId);
      
      if (membersError) throw membersError;
      
      // Get prayer data and achievements for each member
      const membersWithDetails = await Promise.all((membersData || []).map(async (member) => {
        const monthlyProgress = await calculateMemberProgress(member.user_id, 30);
        const weeklyProgress = await calculateMemberProgress(member.user_id, 7);
        const prayers = await getMemberPrayers(member.user_id);
        
        // Get achievements
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select('title')
          .eq('user_id', member.user_id);
        
        const achievements = (achievementsData || []).map(a => a.title);
        
        return {
          id: member.user_id,
          name: member.profiles?.name || 'Anonymous',
          avatar: member.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${member.user_id}`,
          monthlyProgress,
          weeklyProgress,
          achievements,
          prayers,
          isTopPerformer: false
        };
      }));
      
      // Determine top performer
      if (membersWithDetails.length > 0) {
        const topPerformer = membersWithDetails.reduce((prev, current) => 
          prev.weeklyProgress > current.weeklyProgress ? prev : current
        );
        
        // Mark the top performer
        membersWithDetails.forEach(member => {
          if (member.id === topPerformer.id) {
            member.isTopPerformer = true;
          }
        });
      }
      
      // Set group data
      setGroup({
        id: groupData.id,
        name: groupData.name,
        inviteCode: groupData.invite_code,
        members: membersWithDetails
      });
      
      // Set invite URL
      const url = `${window.location.origin}/invite/${groupData.invite_code}`;
      setInviteUrl(url);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };
  
  const calculateMemberProgress = async (userId: string, days: number) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', userId)
        .gte('year', startDate.getFullYear())
        .lte('year', endDate.getFullYear());
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      let totalPrayers = 0;
      let completedPrayers = 0;
      
      data.forEach(prayer => {
        const prayerDate = new Date(prayer.year, prayer.month - 1, prayer.day);
        
        if (prayerDate >= startDate && prayerDate <= endDate) {
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
  
  const getMemberPrayers = async (userId: string) => {
    try {
      const currentDate = new Date();
      const pastWeek: Record<string, Prayer> = {};
      
      // Get prayers for the past week
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const dateKey = `${year}-${month}-${day}`;
        
        const { data } = await supabase
          .from('prayers')
          .select('fajr, zuhr, asr, maghrib, isha')
          .eq('user_id', userId)
          .eq('day', day)
          .eq('month', month)
          .eq('year', year)
          .maybeSingle();
        
        if (data) {
          pastWeek[dateKey] = {
            fajr: !!data.fajr,
            zuhr: !!data.zuhr,
            asr: !!data.asr,
            maghrib: !!data.maghrib,
            isha: !!data.isha
          };
        } else {
          pastWeek[dateKey] = {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          };
        }
      }
      
      return pastWeek;
    } catch (error) {
      console.error('Error getting prayers:', error);
      return {};
    }
  };
  
  const checkForAchievements = async (groupId: string) => {
    try {
      // Get current date
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      
      // Only run this check on Sundays (end of week)
      if (dayOfWeek !== 0) return;
      
      // Get group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
      
      if (membersError) throw membersError;
      
      if (!membersData || membersData.length === 0) return;
      
      // Calculate weekly progress for all members
      const membersProgress = await Promise.all(membersData.map(async (member) => {
        const progress = await calculateMemberProgress(member.user_id, 7);
        return { userId: member.user_id, progress };
      }));
      
      // Find top performer
      if (membersProgress.length > 0) {
        const topPerformer = membersProgress.reduce((prev, current) => 
          prev.progress > current.progress ? prev : current
        );
        
        // Only award if progress is substantial (at least 50%)
        if (topPerformer.progress >= 50) {
          // Check if achievement already exists
          const { data: existingAchievement } = await supabase
            .from('achievements')
            .select('id')
            .eq('user_id', topPerformer.userId)
            .eq('title', 'Weekly Prayer Champion')
            .eq('group_id', groupId)
            .gte('created_at', new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7).toISOString())
            .maybeSingle();
          
          if (!existingAchievement) {
            // Add achievement
            await supabase
              .from('achievements')
              .insert([{
                user_id: topPerformer.userId,
                group_id: groupId,
                title: 'Weekly Prayer Champion',
                description: `Top performer with ${topPerformer.progress}% completion for the week`
              }]);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };
  
  const handleShareInvite = () => {
    setShowInviteDialog(true);
  };
  
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Group not found</h2>
          <Button onClick={() => navigate("/groups")}>
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-primary/10 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{group.name}</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleShareInvite}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Invite
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/groups")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Groups
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {group.members.map((member) => (
            <Card key={member.id} className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40"
                    />
                    {member.isTopPerformer && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1" title="Weekly Top Performer">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      {member.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monthly Progress: {member.monthlyProgress}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Weekly Progress: {member.weeklyProgress}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">This Week's Prayer Record</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(member.prayers).map(([dateStr, prayers]) => {
                      const date = new Date(dateStr);
                      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const dayName = dayNames[date.getDay()];
                      const dayNum = date.getDate();
                      
                      // Count completed prayers
                      const completedCount = Object.values(prayers).filter(val => val).length;
                      const progressPercentage = (completedCount / 5) * 100;
                      
                      return (
                        <div key={dateStr} className="bg-white dark:bg-slate-700 rounded-lg p-2 text-center shadow-sm">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{dayName}</div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{dayNum}</div>
                          <Progress value={progressPercentage} className="h-1.5 mt-1" />
                          <div className="text-xs mt-1 text-primary dark:text-primary/90">{completedCount}/5</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Achievements
                  </h4>
                  {member.achievements.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {member.achievements.map((achievement) => (
                        <div
                          key={achievement}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full"
                        >
                          <Trophy className="w-4 h-4 text-primary dark:text-primary/90" />
                          <span className="text-sm text-primary dark:text-primary/90">
                            {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No achievements yet</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Share Invite Link</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share this link with friends to invite them to {group.name}.
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
                <Share2 className="h-4 w-4" />
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

export default GroupDetails;
