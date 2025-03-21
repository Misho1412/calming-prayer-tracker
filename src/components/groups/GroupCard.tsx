
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface Member {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface GroupCardProps {
  groupId?: string;
  members: Member[];
  onAddMember: () => void;
}

export const GroupCard = ({ groupId = "1", members, onAddMember }: GroupCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-fadeIn border border-primary/10 dark:border-slate-700/50">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <Progress value={member.progress} className="h-2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No members yet. Add your first member!
          </div>
        )}
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={onAddMember}
            className="w-full px-4 py-2 text-sm text-accent dark:text-accent-foreground border border-accent dark:border-accent-foreground rounded-lg hover:bg-accent hover:text-white dark:hover:bg-accent-foreground dark:hover:text-accent transition-colors"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};
