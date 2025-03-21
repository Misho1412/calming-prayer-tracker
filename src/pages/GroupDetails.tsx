
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface Prayer {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  monthlyProgress: number;
  achievements: string[];
  prayers: Prayer;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
}

// Mock data - in a real app this would come from your backend
const mockGroupsData: Group[] = [
  {
    id: "1",
    name: "Morning Prayer Warriors",
    members: [
      {
        id: "1",
        name: "Ahmed Hassan",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        monthlyProgress: 85,
        achievements: ["Early Bird", "30 Days Streak", "Group Leader"],
        prayers: {
          fajr: 90,
          dhuhr: 85,
          asr: 80,
          maghrib: 95,
          isha: 75
        }
      },
      {
        id: "2",
        name: "Sara Ahmed",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        monthlyProgress: 92,
        achievements: ["Perfect Week", "Community Helper"],
        prayers: {
          fajr: 95,
          dhuhr: 90,
          asr: 92,
          maghrib: 93,
          isha: 90
        }
      }
    ]
  }
];

const GroupDetails = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundGroup = mockGroupsData.find(g => g.id === groupId);
    setGroup(foundGroup || null);
  }, [groupId]);

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
            <Button
              variant="ghost"
              onClick={() => navigate("/groups")}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Back to Groups
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {group.members.map((member) => (
            <Card key={member.id} className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Monthly Progress: {member.monthlyProgress}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Prayer Statistics</h4>
                  {Object.entries(member.prayers).map(([prayer, percentage]) => (
                    <div key={prayer} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300 capitalize">{prayer}</span>
                        <span className="text-gray-900 dark:text-white">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Achievements
                  </h4>
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GroupDetails;
