import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

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
  const [monthProgress, setMonthProgress] = useState(65);
  const [daysData, setDaysData] = useState(
    Array(31)
      .fill(null)
      .map(() => Array(5).fill(false))
  );

  const currentDay = new Date().getDate();

  const handleTogglePrayer = (dayIndex: number, prayerIndex: number) => {
    if (dayIndex + 1 !== currentDay) return;
    const newDaysData = [...daysData];
    newDaysData[dayIndex][prayerIndex] = !newDaysData[dayIndex][prayerIndex];
    setDaysData(newDaysData);
  };

  return (
    <div className="relative min-h-screen space-y-8 animate-fadeIn p-6">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 dark:from-slate-900/90 dark:via-primary/20 dark:to-slate-800/90 animate-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwViIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
      </div>

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