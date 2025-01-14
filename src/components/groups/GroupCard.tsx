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
    <div className="bg-white rounded-xl shadow-sm p-6 animate-fadeIn">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <Progress value={member.progress} className="h-2 mt-1" />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onAddMember}
          className="w-full mt-4 px-4 py-2 text-sm text-accent border border-accent rounded-lg hover:bg-accent hover:text-white transition-colors"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};