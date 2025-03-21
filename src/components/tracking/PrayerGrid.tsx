
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Prayer times for Egypt (Cairo)
const egyptPrayerTimes = {
  Fajr: "04:15 AM",
  Sunrise: "05:45 AM",
  Zuhr: "11:55 AM",
  Asr: "03:30 PM",
  Maghrib: "06:15 PM",
  Isha: "07:45 PM"
};

const prayers = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

interface DayProps {
  date: number;
  prayers: boolean[];
  onTogglePrayer: (prayerIndex: number) => void;
  isCurrentDay: boolean;
}

const Day = ({ date, prayers: prayerStates, onTogglePrayer, isCurrentDay }: DayProps) => (
  <div className={`dark:bg-slate-800/50 bg-white/50 backdrop-blur-sm p-4 border dark:border-slate-700/50 border-primary/20 rounded-xl shadow-sm transition-all duration-300 animate-fadeIn ${
    isCurrentDay ? 'ring-2 ring-primary dark:ring-primary/70' : 'hover:shadow-md'
  }`}>
    <div className="text-base font-semibold mb-3 text-primary dark:text-primary/90">
      {date}
      {isCurrentDay && <span className="ml-2 text-xs text-accent dark:text-accent/90">(Today)</span>}
    </div>
    <div className="space-y-2">
      {prayers.map((prayerName, index) => (
        <button
          key={index}
          onClick={() => onTogglePrayer(index)}
          disabled={!isCurrentDay}
          className={`w-full py-2 px-3 rounded-lg transition-all duration-300 ${
            prayerStates[index]
              ? "bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary/90 font-medium shadow-inner transform hover:scale-[0.98]"
              : "bg-muted dark:bg-slate-700/50 hover:bg-muted/80 dark:hover:bg-slate-600/50 text-muted-foreground dark:text-slate-300 hover:text-foreground"
          } ${!isCurrentDay && "opacity-60 cursor-not-allowed"}`}
        >
          {prayerName}
        </button>
      ))}
    </div>
  </div>
);

export const PrayerGrid = () => {
  const [monthProgress, setMonthProgress] = useState(0);
  const [daysData, setDaysData] = useState(
    Array(31)
      .fill(null)
      .map(() => Array(5).fill(false))
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get user ID and prayer data
  useEffect(() => {
    const fetchUserAndPrayers = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Fetch prayer data for the current month
          const { data, error } = await supabase
            .from('prayers')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .eq('year', currentYear);
          
          if (error) {
            console.error('Error fetching prayers:', error);
            return;
          }
          
          if (data && data.length > 0) {
            // Transform data to our state format
            const newDaysData = [...daysData];
            
            data.forEach(prayer => {
              if (prayer.day >= 1 && prayer.day <= 31) {
                newDaysData[prayer.day - 1] = [
                  prayer.fajr || false,
                  prayer.zuhr || false,
                  prayer.asr || false,
                  prayer.maghrib || false,
                  prayer.isha || false
                ];
              }
            });
            
            setDaysData(newDaysData);
            calculateProgress(newDaysData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndPrayers();
  }, []);

  // Calculate progress percentage
  const calculateProgress = (data: boolean[][]) => {
    let totalPrayers = 0;
    let completedPrayers = 0;
    
    // Only count days that have passed
    for (let i = 0; i < currentDay; i++) {
      totalPrayers += 5; // 5 prayers per day
      completedPrayers += data[i].filter(prayer => prayer).length;
    }
    
    const progressPercentage = totalPrayers > 0 
      ? Math.round((completedPrayers / totalPrayers) * 100) 
      : 0;
    
    setMonthProgress(progressPercentage);
  };

  const handleTogglePrayer = async (dayIndex: number, prayerIndex: number) => {
    if (dayIndex + 1 !== currentDay || !userId) return;
    
    try {
      // Update UI immediately for responsiveness
      const newDaysData = [...daysData];
      newDaysData[dayIndex][prayerIndex] = !newDaysData[dayIndex][prayerIndex];
      setDaysData(newDaysData);
      
      // Calculate new progress
      calculateProgress(newDaysData);
      
      // Save to Supabase
      const day = dayIndex + 1;
      
      // Prepare prayer data object
      const prayerData: Record<string, any> = {
        user_id: userId,
        day,
        month: currentMonth,
        year: currentYear,
      };
      
      // Set the specific prayer field based on prayerIndex
      switch(prayerIndex) {
        case 0: prayerData.fajr = newDaysData[dayIndex][prayerIndex]; break;
        case 1: prayerData.zuhr = newDaysData[dayIndex][prayerIndex]; break;
        case 2: prayerData.asr = newDaysData[dayIndex][prayerIndex]; break;
        case 3: prayerData.maghrib = newDaysData[dayIndex][prayerIndex]; break;
        case 4: prayerData.isha = newDaysData[dayIndex][prayerIndex]; break;
      }
      
      // Check if record exists for this day
      const { data, error: fetchError } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', userId)
        .eq('day', day)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('prayers')
          .update(prayerData)
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('prayers')
          .insert([prayerData]);
        
        if (error) throw error;
      }
      
      toast.success(`Prayer ${newDaysData[dayIndex][prayerIndex] ? 'completed' : 'uncompleted'}`);
    } catch (error) {
      console.error('Error saving prayer:', error);
      toast.error('Failed to save your prayer status');
      
      // Revert UI changes on error
      const revertDaysData = [...daysData];
      revertDaysData[dayIndex][prayerIndex] = !revertDaysData[dayIndex][prayerIndex];
      setDaysData(revertDaysData);
      calculateProgress(revertDaysData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-8 animate-fadeIn p-6">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 dark:from-slate-900/90 dark:via-primary/20 dark:to-slate-800/90 animate-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaHYwViIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prayer Progress */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-primary/10 dark:border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-primary dark:text-primary/90">Monthly Progress</h3>
          <Progress 
            value={monthProgress} 
            className="h-3 bg-muted dark:bg-slate-700"
          />
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-4 font-medium">
            {monthProgress}% of prayers completed this month
          </p>
        </div>
        
        {/* Egypt Prayer Times */}
        <Card className="border border-primary/10 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary dark:text-primary/90">Egypt Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {Object.entries(egyptPrayerTimes).map(([prayer, time]) => (
                <li key={prayer} className="flex justify-between items-center border-b dark:border-slate-700/50 pb-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{prayer}</span>
                  <span className="text-gray-600 dark:text-gray-400">{time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 animate-slideIn relative"
      >
        {daysData.map((prayers, dayIndex) => (
          <Day
            key={dayIndex}
            date={dayIndex + 1}
            prayers={prayers}
            onTogglePrayer={(prayerIndex) => handleTogglePrayer(dayIndex, prayerIndex)}
            isCurrentDay={dayIndex + 1 === currentDay}
          />
        ))}
      </div>
    </div>
  );
};
