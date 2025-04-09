import React, { useEffect } from "react";

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
  useEffect(() => {
    console.log("Gallery component rendered with", images.length, "images");
  }, [images]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("Mouse enter on container");
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = "scale(1.15)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("Mouse leave from container");
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = "scale(1)";
    }
  };

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
              className="relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300"
              onClick={() => onImageClick(url)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transformOrigin: "center",
              }}
            >
              <img
                src={url}
                alt={`LGTM ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg transition-all duration-300"
                style={{
                  transformOrigin: "center",
                  transform: "scale(1)",
                  transition: "transform 0.3s ease-in-out",
                }}
                loading="lazy"
              />

              {/* ホバー効果のためのオーバーレイ */}
              <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 hover:opacity-100 transition-opacity rounded-lg"></div>
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
