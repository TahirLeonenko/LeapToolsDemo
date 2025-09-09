"use client";

import Image from "next/image";
import { createApi } from "unsplash-js";
import { MySpaceModel } from "../types/mySpaceModel";
import { useEffect, useState } from "react";

interface ImageBackgroundProps {
  currentImage: MySpaceModel;
  objectFit?: 'cover' | 'contain';
}

export default function ImageBackground({ currentImage, objectFit = 'cover' }: ImageBackgroundProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (currentImage.photoId) {
        // Makes sure access key is set for Unsplash
        if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
          console.error("Missing Unsplash access key");
          setIsLoading(false);
          return;
        }
        const unsplash = createApi({
          accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
        });
        // Fetches the image from Unsplash
        try {
          console.log("Fetching image for photoId:", currentImage.photoId);
          const result = await unsplash.photos.get({ photoId: currentImage.photoId });
          if (result.type === "success") {
            // Get the full-size image URL from the photo object
            const imageUrl = result.response.urls.full;
            console.log("Successfully fetched image URL:", imageUrl);
            setImageSrc(imageUrl);
          } else {
            console.error("Failed to fetch photo:", result.errors);
          }
        } catch (error) {
          console.error("Error fetching photo:", error);
        }
      }
      
      setIsLoading(false);
    };

    fetchImage();
  }, [currentImage.photoId]);

  return (
    <div className="w-full h-full bg-gray-800">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading image...</span>
        </div>
      )}
      {imageSrc && !isLoading && (
        <>
          <Image
            src={imageSrc}
            alt={currentImage.name}
            fill
            className={`object-${objectFit} pointer-events-none select-none`}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 75vw"
            onLoad={() => console.log('Image loaded successfully:', currentImage.name)}
            onError={(e) => console.error('Image failed to load:', currentImage.name, e)}
          />
        </>
      )}
      {!imageSrc && !isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
          <span className="text-gray-400 mb-2">No image source</span>
          {!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY && (
            <span className="text-red-400 text-sm">Missing Unsplash API key</span>
          )}
          <span className="text-gray-500 text-xs mt-2">Photo ID: {currentImage.photoId || 'None'}</span>
        </div>
      )}
    </div>
  );
}
