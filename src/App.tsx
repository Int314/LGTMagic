import React, { useState, useRef, useEffect } from "react";
import {
  ImagePlus,
  Download,
  Share2,
  ExternalLink,
  Link,
  Copy,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with proper types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Since we don't need auth for this app
  },
});

// Type for storage data
interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [addLGTMText, setAddLGTMText] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewImage) {
        setPreviewImage(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [previewImage]);

  const fetchGalleryImages = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data: files, error: listError } = await supabase.storage
        .from("lgtm-images")
        .list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) {
        throw listError;
      }

      if (!files) {
        throw new Error("No data received from storage");
      }

      // Get public URLs for all files
      const imageUrls = files.map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from("lgtm-images").getPublicUrl(file.name);
        return publicUrl;
      });

      setGalleryImages(imageUrls);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch images");
      setGalleryImages([]); // Reset gallery on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    setError(null);
    try {
      // Validate URL
      new URL(imageUrl);

      // Use a CORS proxy to load the image
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(
        imageUrl
      )}`;

      // Load image from URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = corsProxyUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          setSelectedImage(corsProxyUrl);
          resolve(null);
        };
        img.onerror = () => {
          reject(new Error("Failed to load image from URL"));
        };
      });
    } catch (err) {
      setError("Invalid URL or failed to load image");
      console.error("Error loading image:", err);
    }
  };

  const generateLGTMImage = () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Enable cross-origin image loading
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      // 画像のリサイズ処理（横幅を600pxに固定し、縦横比を維持）
      const targetWidth = 600;
      const aspectRatio = img.height / img.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);

      // Set canvas size to the resized dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw resized image
      ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (addLGTMText) {
        // Calculate text sizes based on image width
        const lgtmFontSize = Math.min(targetWidth * 0.15, targetHeight * 0.2);
        const subtextFontSize = Math.min(
          targetWidth * 0.05,
          targetHeight * 0.06
        );

        // Calculate background height based on font sizes
        const backgroundHeight = lgtmFontSize * 2 + subtextFontSize * 2;

        // Add semi-transparent background for text
        ctx!.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx?.fillRect(
          0,
          (targetHeight - backgroundHeight) / 2,
          targetWidth,
          backgroundHeight
        );

        // Draw "LGTM"
        ctx!.fillStyle = "white";
        ctx!.font = `bold ${lgtmFontSize}px sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx?.fillText(
          "LGTM",
          targetWidth / 2,
          targetHeight / 2 - lgtmFontSize * 0.5
        );

        // Draw "Looks Good To Me"
        ctx!.font = `${subtextFontSize}px sans-serif`;
        ctx?.fillText(
          "Looks Good To Me",
          targetWidth / 2,
          targetHeight / 2 + lgtmFontSize * 0.5
        );
      }

      setIsGenerating(false);

      // Upload the generated image
      await uploadGeneratedImage();
    };

    img.src = selectedImage;
  };

  const uploadGeneratedImage = async () => {
    if (!canvasRef.current) return;

    setIsUploading(true);
    setError(null);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create image blob"));
        }, "image/png");
      });

      // Upload to Supabase Storage with public access
      const fileName = `lgtm-${Date.now()}.png`;
      const { data, error: uploadError } = await supabase.storage
        .from("lgtm-images")
        .upload(fileName, blob, {
          contentType: "image/png",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("lgtm-images").getPublicUrl(fileName);

      setUploadedUrl(publicUrl);

      // Refresh gallery
      await fetchGalleryImages();
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      generateLGTMImage();
    }
  }, [selectedImage]);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "lgtm-image.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const copyToClipboard = async (
    url: string,
    format: "url" | "markdown" = "url"
  ) => {
    try {
      const textToCopy = format === "markdown" ? `![LGTM](${url})` : url;
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(
        format === "markdown" ? "Markdown copied!" : "URL copied!"
      );
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopySuccess("Failed to copy");
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      setPreviewImage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">LGTMagic</h1>
        <p className="text-gray-400 text-center mb-8">
          Transform your images into magical LGTM stamps
        </p>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-8">
            <p className="text-center">{error}</p>
          </div>
        )}

        {copySuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
            {copySuccess}
          </div>
        )}

        {/* Modal Preview */}
        {previewImage && (
          <div
            ref={modalRef}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleModalClick}
          >
            <div className="relative bg-gray-900 rounded-lg p-6 max-w-3xl w-full">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full object-contain rounded-lg mb-6"
                style={{ maxHeight: "70vh" }}
              />
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => copyToClipboard(previewImage)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  Copy URL
                </button>
                <button
                  onClick={() => copyToClipboard(previewImage, "markdown")}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  <Copy className="w-5 h-5" />
                  Copy as Markdown
                </button>
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-semibold text-center">
            Recent LGTM Images
          </h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((url, index) => (
                <div
                  key={index}
                  className="relative group"
                  onClick={() => setPreviewImage(url)}
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

        <div className="space-y-12">
          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <div className="flex flex-col items-center space-y-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageInput"
                />
                <label
                  htmlFor="imageInput"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <ImagePlus className="w-12 h-12 text-gray-400" />
                  <span className="text-gray-400">
                    Click to upload or drag and drop an image
                  </span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="addLGTMText"
                    checked={addLGTMText}
                    onChange={(e) => setAddLGTMText(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="addLGTMText" className="text-gray-300">
                    Add LGTM text to image
                  </label>
                </div>
              </div>
            </div>

            {/* URL Input */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <form
                onSubmit={handleUrlSubmit}
                className="flex flex-col items-center space-y-6"
              >
                <Link className="w-12 h-12 text-gray-400" />
                <div className="w-full max-w-md space-y-4">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="addLGTMTextUrl"
                      checked={addLGTMText}
                      onChange={(e) => setAddLGTMText(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="addLGTMTextUrl" className="text-gray-300">
                      Add LGTM text to image
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                  >
                    Generate from URL
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg shadow-xl"
                />
                {(isGenerating || isUploading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                    disabled={isGenerating || isUploading}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                {uploadedUrl && (
                  <div className="text-center w-full max-w-xl">
                    <p className="text-gray-400 mb-2">Share your LGTM image:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={uploadedUrl}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-800 rounded-l border border-gray-700 text-gray-200"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={() => copyToClipboard(uploadedUrl)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 transition duration-200"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
