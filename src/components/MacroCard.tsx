
import React, { ReactNode } from 'react';
import { Card } from "@/components/ui/card";
import { Bolt, Circle, Droplet } from 'lucide-react';

interface MacroCardProps {
  value: number;
  label: string;
  unit: string;
  color: string;
  icon: 'bolt' | 'dots' | 'droplet';
}

const MacroCard: React.FC<MacroCardProps> = ({ value, label, unit, color, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'bolt':
        return <Bolt className="w-5 h-5 text-red-500" />;
      case 'dots':
        return <Circle className="w-5 h-5 text-amber-700" />;
      case 'droplet':
        return <Droplet className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card className="p-4 text-center">
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
        {value}{unit}
      </div>
      <div className="text-gray-500 text-sm flex items-center justify-center gap-1">
        {getIcon()}
        {label}
      </div>
    </Card>
  );
};

export default MacroCard;
