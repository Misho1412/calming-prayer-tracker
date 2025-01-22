import { Progress } from "@/components/ui/progress";

interface Member {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface GroupCardProps {
  members: Member[];
  onAddMember: () => void;
}

export const GroupCard = ({ members, onAddMember }: GroupCardProps) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm p-6 animate-fadeIn border border-primary/10 dark:border-slate-700/50">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
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
        <button
          onClick={onAddMember}
          className="w-full mt-4 px-4 py-2 text-sm text-accent dark:text-accent-foreground border border-accent dark:border-accent-foreground rounded-lg hover:bg-accent hover:text-white dark:hover:bg-accent-foreground dark:hover:text-accent transition-colors"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};