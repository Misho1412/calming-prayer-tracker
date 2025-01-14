import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface DayProps {
  date: number;
  prayers: boolean[];
  onTogglePrayer: (prayerIndex: number) => void;
}

const Day = ({ date, prayers, onTogglePrayer }: DayProps) => (
  <div className="p-2 border rounded-lg">
    <div className="text-sm font-medium mb-2">{date}</div>
    <div className="space-y-1">
      {prayers.map((done, index) => (
        <button
          key={index}
          onClick={() => onTogglePrayer(index)}
          className={`w-full text-xs py-1 rounded transition-colors ${
            done
              ? "bg-primary/20 text-primary"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
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

  const handleTogglePrayer = (dayIndex: number, prayerIndex: number) => {
    const newDaysData = [...daysData];
    newDaysData[dayIndex][prayerIndex] = !newDaysData[dayIndex][prayerIndex];
    setDaysData(newDaysData);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
        <Progress value={monthProgress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">{monthProgress}% completed</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysData.map((prayers, dayIndex) => (
          <Day
            key={dayIndex}
            date={dayIndex + 1}
            prayers={prayers}
            onTogglePrayer={(prayerIndex) => handleTogglePrayer(dayIndex, prayerIndex)}
          />
        ))}
      </div>
    </div>
  );
};