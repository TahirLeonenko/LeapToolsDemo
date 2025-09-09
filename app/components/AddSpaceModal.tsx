'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createApi } from 'unsplash-js';
import { MySpaceModel } from '../types/mySpaceModel';

interface AddSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSpace: Omit<MySpaceModel, 'id' | 'favourite'>) => void;
  initialData?: MySpaceModel;
  title?: string;
}

export default function AddSpaceModal({ isOpen, onClose, onSubmit, initialData, title = "Add New Space" }: AddSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    floor: initialData?.floor || '',
    wall: initialData?.wall || '',
    photoId: initialData?.photoId || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        floor: initialData.floor || '',
        wall: initialData.wall || '',
        photoId: initialData.photoId || ''
      });
    } else {
      setFormData({
        name: '',
        floor: '',
        wall: '',
        photoId: ''
      });
    }
    setErrors({});
  }, [initialData]);

  const validatePhotoId = async (photoId: string): Promise<boolean> => {
    if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      setErrors(prev => ({ ...prev, photoId: 'Missing Unsplash API key' }));
      return false;
    }

    const unsplash = createApi({
      accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    });

    try {
      const result = await unsplash.photos.get({ photoId });
      
      if (result.type === "success" && result.response && result.response.urls && result.response.urls.full) {
        return true;
      } else {
        const errorMessage = result.errors?.[0] || "Invalid photo ID";
        setErrors(prev => ({ ...prev, photoId: `Invalid photo ID: ${errorMessage}` }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setErrors(prev => ({ ...prev, photoId: `Failed to validate photo ID: ${errorMessage}` }));
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }
    if (!formData.wall.trim()) {
      newErrors.wall = 'Wall is required';
    }
    if (!formData.photoId.trim()) {
      newErrors.photoId = 'Photo ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsValidating(true);
      
      // Validate photo ID with Unsplash API
      const isPhotoIdValid = await validatePhotoId(formData.photoId);
      
      if (isPhotoIdValid) {
        // Only create the model if photo ID is valid
        onSubmit(formData);
        setFormData({ name: '', floor: '', wall: '', photoId: '' });
        setErrors({});
        onClose();
      }
      
      setIsValidating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter space name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Floor Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Floor *
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.floor ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="e.g., Hardwood, Carpet, Tile"
                />
                {errors.floor && (
                  <p className="text-red-400 text-sm mt-1">{errors.floor}</p>
                )}
              </div>

              {/* Wall Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Wall *
                </label>
                <input
                  type="text"
                  value={formData.wall}
                  onChange={(e) => handleInputChange('wall', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.wall ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="e.g., White, Grey, Blue"
                />
                {errors.wall && (
                  <p className="text-red-400 text-sm mt-1">{errors.wall}</p>
                )}
              </div>

              {/* Photo ID Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Unsplash Photo ID *
                </label>
                <input
                  type="text"
                  value={formData.photoId}
                  onChange={(e) => handleInputChange('photoId', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.photoId ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter Unsplash photo ID"
                />
                {errors.photoId && (
                  <p className="text-red-400 text-sm mt-1">{errors.photoId}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  Get photo IDs from Unsplash URLs (e.g., "a-living-room-filled-with-furniture-and-a-flat-screen-tv-shT_LaGUmYI")
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isValidating}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                    isValidating 
                      ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isValidating ? 'Validating...' : (initialData ? 'Update Space' : 'Add Space')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
