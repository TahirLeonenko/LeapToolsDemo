'use client';

import { SignOut, SquaresFour, Share } from 'phosphor-react';
import { useRouter } from 'next/navigation';

interface NavigationBarProps {
  currentModelId: string;
  onMySpacesClick: () => void;
}

export default function NavigationBar({ currentModelId, onMySpacesClick }: NavigationBarProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[60]">
      <div className="bg-gray-500/30 backdrop-blur-sm rounded-b-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          {/* EXIT Button */}
          <button className="flex items-center gap-2 bg-black/30 hover:bg-black/40 rounded-lg px-4 py-2 transition-colors duration-200">
            <SignOut size={20} weight="bold" className="text-white" />
            <span className="text-white font-medium text-sm">EXIT</span>
          </button>

          {/* MY SPACES Button */}
          <button 
            onClick={onMySpacesClick}
            className="flex items-center gap-2 bg-black/30 hover:bg-black/40 rounded-lg px-4 py-2 transition-colors duration-200"
          >
            <SquaresFour size={20} weight="bold" className="text-white" />
            <span className="text-white font-medium text-sm">MY SPACES</span>
          </button>

          {/* SHARE Button */}
          <button className="flex items-center gap-2 bg-black/30 hover:bg-black/40 rounded-lg px-4 py-2 transition-colors duration-200">
            <Share size={20} weight="bold" className="text-white" />
            <span className="text-white font-medium text-sm">SHARE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
