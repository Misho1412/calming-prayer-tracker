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

const Day = ({ date, prayers, onTogglePrayer, isCurrentDay }: DayProps) => (
  <div className={`bg-white/50 backdrop-blur-sm p-4 border border-primary/20 rounded-xl shadow-sm transition-all duration-300 animate-fadeIn ${
    isCurrentDay ? 'ring-2 ring-primary' : 'hover:shadow-md'
  }`}>
    <div className="text-base font-semibold mb-3 text-primary">
      {date}
      {isCurrentDay && <span className="ml-2 text-xs text-accent">(Today)</span>}
    </div>
    <div className="space-y-2">
      {prayers.map((done, index) => (
        <button
          key={index}
          onClick={() => onTogglePrayer(index)}
          disabled={!isCurrentDay}
          className={`w-full py-2 px-3 rounded-lg transition-all duration-300 ${
            done
              ? "bg-primary/20 text-primary font-medium shadow-inner transform hover:scale-[0.98]"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          } ${!isCurrentDay && "opacity-60 cursor-not-allowed"}`}
        >
          {prayers[index]}
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

  // Get current day of the month
  const currentDay = new Date().getDate();

  const handleTogglePrayer = (dayIndex: number, prayerIndex: number) => {
    // Only allow toggling prayers for the current day
    if (dayIndex + 1 !== currentDay) return;

    const newDaysData = [...daysData];
    newDaysData[dayIndex][prayerIndex] = !newDaysData[dayIndex][prayerIndex];
    setDaysData(newDaysData);
  };

  return (
    <div className="space-y-8 animate-fadeIn p-6">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-primary/10">
        <h3 className="text-2xl font-semibold mb-6 text-primary">Monthly Progress</h3>
        <Progress 
          value={monthProgress} 
          className="h-3 bg-muted"
        />
        <p className="text-sm text-muted-foreground mt-4 font-medium">
          {monthProgress}% of prayers completed this month
        </p>
      </div>
      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 animate-slideIn"
        style={{
          background: "linear-gradient(109.6deg, rgba(223,234,247,0.9) 11.2%, rgba(244,248,252,0.9) 91.1%)",
          padding: "2rem",
          borderRadius: "1rem",
        }}
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