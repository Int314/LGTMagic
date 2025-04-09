import React from "react";

interface GalleryProps {
  isLoading: boolean;
  images: string[];
  onImageClick: (url: string) => void;
}

/**
 * 画像ギャラリーを表示するコンポーネント
 */
const Gallery: React.FC<GalleryProps> = ({
  isLoading,
  images,
  onImageClick,
}) => {
  return (
    <div className="space-y-4 mb-12">
      <h2 className="text-2xl font-semibold text-center">Recent LGTM Images</h2>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group"
              onClick={() => onImageClick(url)}
            >
              <img
                src={url}
                alt={`LGTM ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          No images in the gallery yet
        </p>
      )}
    </div>
  );
};

export default Gallery;
