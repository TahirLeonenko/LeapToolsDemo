"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X, Share, Heart, Copy, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageBackground from "./components/ImageBackground";
import MySpaceNavigationBar from "./components/MySpaceNavigationBar";
import HomeNavigationBar from "./components/HomeNavigationBar";
import AddSpaceModal from "./components/AddSpaceModal";
import { MySpaceModel, sampleMySpaceList } from "./types/mySpaceModel";

interface HomeClientProps {
  initialSpaces: MySpaceModel[];
}

export default function HomeClient({ initialSpaces }: HomeClientProps) {
  const [spacesList, setSpacesList] = useState<MySpaceModel[]>(initialSpaces);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [dragStart, setDragStart] = useState(0);
  const [dragPercent, setDragPercent] = useState(0);
  const [isAddSpaceModalOpen, setIsAddSpaceModalOpen] = useState(false);
  const [isEditSpaceModalOpen, setIsEditSpaceModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark as hydrated after client-side mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isLastImage = currentIndex === spacesList.length - 1;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragPercent(0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percent = (deltaX / containerWidth) * 100;
    setDragPercent(percent);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsTransitioning(true);
    
    const threshold = 5; // Minimum drag distance to trigger navigation (reduced for better responsiveness)
    const dragDistance = Math.abs(dragPercent);
    
    if (dragDistance > threshold) {
      if (dragPercent > 0 && currentIndex > 0) {
        // Drag right - go to previous
        setCurrentIndex(prev => prev - 1);
      } else if (dragPercent < 0 && currentIndex < spacesList.length - 1) {
        // Drag left - go to next
        setCurrentIndex(prev => prev + 1);
      }
    }
    
    setDragPercent(0);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  }, [isDragging, dragPercent, currentIndex, spacesList.length]);

  const handleDoneClick = useCallback(() => {
    if (isDragging || isTransitioning) return;
    setIsFullscreen(true);
  }, [isDragging, isTransitioning]);

  const handleMySpacesClick = useCallback(() => {
    if (isDragging || isTransitioning) return;
    setIsFullscreen(false);
  }, [isDragging, isTransitioning]);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const handleCarouselClick = useCallback((e: React.MouseEvent) => {
    // Only handle click if not dragging and not transitioning
    if (isDragging || isTransitioning) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;
    const clickPercent = clickX / containerWidth;
    
    if (clickPercent < 0.5 && currentIndex > 0) {
      // Click left half - go to previous
      setCurrentIndex(prev => prev - 1);
    } else if (clickPercent >= 0.5 && currentIndex < spacesList.length - 1) {
      // Click right half - go to next
      setCurrentIndex(prev => prev + 1);
    }
  }, [isDragging, isTransitioning, currentIndex, spacesList.length]);

  const handlePlusButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Plus button clicked - currentIndex:', currentIndex, 'spacesList.length:', spacesList.length, 'isLastImage:', isLastImage);
    setIsAddSpaceModalOpen(true);
  }, [currentIndex, spacesList.length, isLastImage]);

  const handleEditButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditSpaceModalOpen(true);
  }, []);

  const handleAddSpaceSubmit = useCallback((newSpaceData: Omit<MySpaceModel, 'id' | 'favourite'>) => {
    console.log('Before adding space - currentIndex:', currentIndex, 'spacesList.length:', spacesList.length);
    
    // Generate new ID by finding the highest existing ID and adding 1
    const maxId = Math.max(...spacesList.map(space => parseInt(space.id)));
    const newId = (maxId + 1).toString();
    
    const newSpace: MySpaceModel = {
      ...newSpaceData,
      id: newId,
      favourite: false
    };
    
    // Create new list
    const newList = [...spacesList, newSpace];
    setSpacesList(newList);
    
    // Now update index separately
    const newIndex = newList.length - 1;
    console.log('Setting currentIndex to:', newIndex, 'newList.length:', newList.length);
    setCurrentIndex(newIndex);
    
    // Also persist in sampleMySpaceList
    sampleMySpaceList.push(newSpace);
  }, [spacesList, currentIndex]);

  const handleEditSpaceSubmit = useCallback((updatedSpaceData: Omit<MySpaceModel, 'id' | 'favourite'>) => {
    setSpacesList(prev => prev.map((space, index) => 
      index === currentIndex 
        ? { ...space, ...updatedSpaceData }
        : space
    ));
    
    // Also update the sampleMySpaceList
    const spaceToUpdate = sampleMySpaceList.find(space => space.id === spacesList[currentIndex].id);
    if (spaceToUpdate) {
      Object.assign(spaceToUpdate, updatedSpaceData);
    }
    
    setIsEditSpaceModalOpen(false);
  }, [currentIndex, spacesList]);

  const handleFavouriteClick = useCallback(() => {
    setSpacesList(prev => prev.map((space, index) => 
      index === currentIndex 
        ? { ...space, favourite: !space.favourite }
        : space
    ));
  }, [currentIndex]);

  const handleDuplicateClick = useCallback(() => {
    const currentSpace = spacesList[currentIndex];
    const newId = Math.max(...spacesList.map(s => parseInt(s.id))) + 1;
    
    const duplicatedSpace: MySpaceModel = {
      ...currentSpace,
      id: newId.toString(),
      name: `${currentSpace.name} (Copy)`,
      favourite: false
    };
    
    setSpacesList(prev => [...prev, duplicatedSpace]);
    
    // Navigate to the new duplicated space with transition effect
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(spacesList.length); // New space will be at the end
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
    }, 100);
  }, [currentIndex, spacesList]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard support for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleExitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleExitFullscreen]);

  return (
    <main className="w-full h-screen bg-gray-900 flex items-center justify-center p-8 relative">
      {/* Navigation Bars */}
      {!isFullscreen && (
        <div className="relative z-50">
          <MySpaceNavigationBar 
            currentModelId={spacesList[currentIndex]?.id || ''} 
            onDoneClick={handleDoneClick} 
          />
        </div>
      )}
      
      {isFullscreen && (
        <div className="relative z-50">
          <HomeNavigationBar 
            currentModelId={spacesList[currentIndex]?.id || ''} 
            onMySpacesClick={handleMySpacesClick} 
          />
        </div>
      )}

      {/* Carousel - only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="relative w-full h-3/4">
          {/* Show server-side image while hydrating */}
          {!isHydrated && (
            <div className="w-full h-full">
              <ImageBackground currentImage={spacesList[0]} objectFit="cover" />
            </div>
          )}
          
          {/* Show interactive carousel after hydration */}
          {isHydrated && (
            <>
              <div 
                ref={containerRef}
                className={`w-full h-full overflow-hidden transition-all duration-700 ${
                  isTransitioning || isDragging ? 'blur-sm' : 'blur-0'
                } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                onMouseDown={onMouseDown}
                onClick={handleCarouselClick}
              >
                <div
                  className={`flex h-full ease-in-out ${
                    isDragging ? '' : 'transition-transform duration-700'
                  }`}
                  style={{
                    transform: `translateX(calc(15% - ${currentIndex * 80.33}% + ${dragPercent}%))`,
                  }}
                >
                  {spacesList.map((space, index) => (
                    <motion.div
                      key={space.id}
                      layoutId={`image-${space.id}`}
                      className="w-[70%] flex-shrink-0 h-full relative mr-48 rounded-2xl overflow-hidden"
                    >
                      <ImageBackground currentImage={space} objectFit="cover" />
                    </motion.div>
                  ))}
                  
                  {/* Plus Button */}
                  {isLastImage && (
                    <div className="w-[70%] flex-shrink-0 h-full relative mr-48 rounded-2xl overflow-hidden">
                      <div 
                        className="w-full h-full bg-gray-700/50 border-2 border-dashed border-gray-500 flex items-center justify-start pl-6 cursor-pointer hover:bg-gray-600/50 transition-colors duration-200"
                        onClick={handlePlusButtonClick}
                      >
                        <div className="text-left">
                          <Plus size={48} height="bold" className="text-white mb-2" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Carousel indicators - only show when not in fullscreen */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {spacesList.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>

              {/* Model info - only show when not in fullscreen */}
              <div className="absolute top-full left-[15%] mt-4">
                <h2 className="text-white text-xl font-semibold mb-2">
                  {spacesList[currentIndex]?.name || 'Room Name'}
                </h2>
                <p className="text-gray-300 text-sm">
                  Floor - {spacesList[currentIndex]?.floor || 'N/A'}   Wall - {spacesList[currentIndex]?.wall || 'N/A'}
                </p>
              </div>

              {/* Action buttons - only show when not in fullscreen */}
              <div className="absolute top-full right-[15%] mt-4 flex gap-3">
                {/* Share Button */}
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  <Share size={16} />
                  <span className="text-sm font-medium">SHARE</span>
                </button>

                {/* Favourite Button */}
                <button 
                  onClick={handleFavouriteClick}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Heart 
                    size={16} 
                    fill={spacesList[currentIndex]?.favourite ? "white" : "transparent"}
                    stroke="white"
                  />
                  <span className="text-sm font-medium">FAVOURITE</span>
                </button>

                {/* Duplicate Button */}
                <button 
                  onClick={handleDuplicateClick}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Copy size={16} />
                  <span className="text-sm font-medium">DUPLICATE</span>
                </button>

                {/* Edit Button */}
                <button 
                  onClick={handleEditButtonClick}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Edit size={16} />
                  <span className="text-sm font-medium">EDIT</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Fullscreen overlay - morphs from carousel image */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              layoutId={`image-${spacesList[currentIndex].id}`}
              className="w-full h-full relative"
            >
              <ImageBackground currentImage={spacesList[currentIndex]} objectFit="cover" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Space Modal */}
      <AddSpaceModal
        isOpen={isAddSpaceModalOpen}
        onClose={() => setIsAddSpaceModalOpen(false)}
        onSubmit={handleAddSpaceSubmit}
      />

      {/* Edit Space Modal */}
      <AddSpaceModal
        isOpen={isEditSpaceModalOpen}
        onClose={() => setIsEditSpaceModalOpen(false)}
        onSubmit={handleEditSpaceSubmit}
        initialData={spacesList[currentIndex]}
        title="Edit Space"
      />
    </main>
  );
}
