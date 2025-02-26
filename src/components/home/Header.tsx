
import React from 'react';
import { Flame } from 'lucide-react';

interface HeaderProps {
  streak: number;
  onStreakClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ streak, onStreakClick }) => {
  return (
    <header className="p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">CaloriesCountAI</h1>
      <button
        onClick={onStreakClick}
        className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
        <span className="font-bold text-xl">{streak}</span>
      </button>
    </header>
  );
};

export default Header;
