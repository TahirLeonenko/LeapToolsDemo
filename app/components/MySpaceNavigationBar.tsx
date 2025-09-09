'use client';

import { Check } from 'phosphor-react';
import { useRouter } from 'next/navigation';

interface MySpaceNavigationBarProps {
  currentModelId: string;
  onDoneClick: () => void;
}

export default function MySpaceNavigationBar({ currentModelId, onDoneClick }: MySpaceNavigationBarProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[60]">
      <div className="bg-gray-500/30 backdrop-blur-sm rounded-b-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center">
          {/* Done Button */}
          <button 
            onClick={onDoneClick}
            className="flex items-center gap-2 bg-black/30 hover:bg-black/40 rounded-lg px-4 py-2 transition-colors duration-200"
          >
            <Check size={20} weight="bold" className="text-white" />
            <span className="text-white font-medium text-sm">DONE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
