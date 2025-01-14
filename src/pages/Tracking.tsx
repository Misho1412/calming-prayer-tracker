import { PrayerGrid } from "@/components/tracking/PrayerGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Tracking = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Prayer Tracking</h1>
            <Button
              variant="ghost"
              onClick={() => navigate("/groups")}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Groups
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrayerGrid />
      </main>
    </div>
  );
};

export default Tracking;