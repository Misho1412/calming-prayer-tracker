
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GroupInvite = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkInvite = async () => {
      try {
        if (!code) {
          setError("Invalid invite link");
          return;
        }

        // Check if group exists
        const { data, error } = await supabase
          .from('groups')
          .select('id, name')
          .eq('invite_code', code)
          .single();

        if (error) {
          console.error('Error fetching group:', error);
          setError("This invite is invalid or has expired");
          return;
        }

        if (data) {
          setGroupName(data.name);
        } else {
          setError("Group not found");
        }
      } catch (err) {
        console.error('Error:', err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [code]);

  const handleJoinGroup = async () => {
    try {
      setJoining(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to join the group");
        navigate("/");
        return;
      }

      // Get group id from invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', code)
        .single();

      if (groupError || !groupData) {
        throw new Error("Group not found");
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError) {
        throw memberCheckError;
      }

      if (existingMember) {
        toast.info("You're already a member of this group");
        navigate(`/groups/${groupData.id}`);
        return;
      }

      // Add user to group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([
          { group_id: groupData.id, user_id: user.id, role: 'member' }
        ]);

      if (joinError) {
        throw joinError;
      }

      toast.success(`You've joined ${groupName}!`);
      navigate(`/groups/${groupData.id}`);
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error("Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        {error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              {error}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The invite link you followed is invalid or has expired.
            </p>
            <Button onClick={() => navigate("/groups")}>
              Go to Groups
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Prayer Group
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've been invited to join <span className="font-medium text-primary">{groupName}</span>
            </p>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleJoinGroup}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Group"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/groups")}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInvite;
