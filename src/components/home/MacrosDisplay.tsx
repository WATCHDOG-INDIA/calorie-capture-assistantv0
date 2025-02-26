
import React from 'react';
import { Card } from "@/components/ui/card";
import MacroCard from '@/components/MacroCard';
import type { MacroSummary } from '@/types/meal';

interface MacrosDisplayProps {
  macros: MacroSummary;
}

const MacrosDisplay: React.FC<MacrosDisplayProps> = ({ macros }) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 transform group-hover:scale-105 transition-transform duration-300" />
        <div className="relative">
          <div className="text-6xl font-bold text-green-500 mb-2 animate-pulse">
            {macros.calories}
          </div>
          <div className="text-gray-500">Calories consumed</div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <MacroCard
          value={macros.protein}
          label="Protein"
          unit="g"
          color="red"
          icon="bolt"
        />
        <MacroCard
          value={macros.carbs}
          label="Carbs"
          unit="g"
          color="yellow"
          icon="dots"
        />
        <MacroCard
          value={macros.fat}
          label="Fats"
          unit="g"
          color="blue"
          icon="droplet"
        />
      </div>
    </div>
  );
};

export default MacrosDisplay;
