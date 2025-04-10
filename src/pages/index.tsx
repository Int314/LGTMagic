import React, { useState } from "react";
import UploadForm from "../components/UploadForm";

const ParentComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [addLGTMText, setAddLGTMText] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);

  const handleImageSelected = async (imageSource: string) => {
    try {
      setIsGenerating(true); // 画像生成開始
      // 画像処理を行う...
      await processImage(imageSource);
      // その他の処理...
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsGenerating(false); // 画像生成完了
    }
  };

  const handleImageGenerationStart = () => {
    setIsImageGenerating(true);
    console.log("Image generation started");
  };

  const handleImageGenerationEnd = () => {
    setIsImageGenerating(false);
    console.log("Image generation completed");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <UploadForm
          onImageSelected={handleImageSelected}
          addLGTMText={addLGTMText}
          setAddLGTMText={setAddLGTMText}
          isGenerating={isImageGenerating} // 画像生成状態を渡す
        />
      </div>

      <div>
        {selectedImage && (
          <ImageGenerator
            selectedImage={selectedImage}
            addLGTMText={addLGTMText}
            onImageUploaded={handleImageUploaded}
            onUploadCountUpdated={handleUploadCountUpdated}
            setSelectedImage={setSelectedImage}
            onGenerationStart={handleImageGenerationStart} // 追加
            onGenerationEnd={handleImageGenerationEnd} // 追加
          />
        )}
      </div>
    </div>
  );
};

export default ParentComponent;
