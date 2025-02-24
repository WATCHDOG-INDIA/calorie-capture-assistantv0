
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Flame } from 'lucide-react';

interface StreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  weeklyCheckins?: string[];
}

const StreakDialog = ({ isOpen, onClose, streak, weeklyCheckins = [] }: StreakDialogProps) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDay = today.getDay();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-0">
        <div className="flex flex-col items-center space-y-6 py-8">
          <div className="relative">
            <Flame className="w-32 h-32 text-orange-500 animate-pulse" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold">
              {streak}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-orange-500">
            day streak!
          </h2>

          <div className="bg-gray-800/50 rounded-xl p-6 w-full">
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const isCheckedIn = weeklyCheckins?.includes(
                  new Date(today.setDate(today.getDate() - currentDay + i)).toISOString().split('T')[0]
                );
                const isPastDay = i < currentDay;
                const isToday = i === currentDay;

                return (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-sm text-gray-400 mb-2">{day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${isCheckedIn ? 'bg-orange-500/20' : 'bg-gray-800'}
                      ${isToday ? 'ring-2 ring-orange-500' : ''}
                    `}>
                      {isCheckedIn && <Check className="w-4 h-4 text-orange-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center mt-4 text-gray-300">
              You're on fire! Keep the flame lit every day!
            </p>
          </div>

          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6"
            onClick={onClose}
          >
            CONTINUE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakDialog;
