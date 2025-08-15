"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertCircle, Image as ImageIcon } from "lucide-react";
import { 
  validateFiles, 
  isValidImageFile, 
  formatFileSize,
  generateAcceptString,
  getErrorSummary,
  DEFAULT_VALIDATION_CONFIG,
  type UploadedImage, 
  type ValidationError,
  type ValidationConfig 
} from "@/lib/imageValidation";

interface ImageUploadFormProps {
  uploadedImages: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  config?: Partial<ValidationConfig>;
  disabled?: boolean;
  className?: string;
  showErrorSummary?: boolean;
}

export default function ImageUploadForm({
  uploadedImages,
  onImagesChange,
  config,
  disabled = false,
  className = "",
  showErrorSummary = true
}: ImageUploadFormProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 設定値をマージ
  const validationConfig = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  const { maxImages, maxFileSize } = validationConfig;

  // 追加選択時にも既存配列に追記されるよう、最新のuploadedImagesに依存
  const handleFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setValidationErrors([]);
    
    // バリデーション実行
    const validation = validateFiles(files, uploadedImages, validationConfig);
    
    if (validation.errors.length > 0) {
      setValidationErrors(validation.errors);
      setIsProcessing(false);
      return;
    }

    // バリデーション通過した新しい画像のみを既存のuploadedImagesに追加
    const newImages = validation.validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    // 重要: 既存のuploadedImagesと新しいnewImagesを統合
    const updatedImages = [...uploadedImages, ...newImages];
    onImagesChange(updatedImages);
    setIsProcessing(false);
  }, [uploadedImages, onImagesChange, validationConfig]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
    
    // ファイル入力をリセット（同じファイルを再選択可能にする）
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const imageToRemove = uploadedImages[index];
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const newImages = uploadedImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [uploadedImages, onImagesChange]);

  const clearAllImages = useCallback(() => {
    uploadedImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    onImagesChange([]);
    setValidationErrors([]);
  }, [uploadedImages, onImagesChange]);

  return (
    <div className={className}>
      {/* Mobile-First Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={generateAcceptString(validationConfig)}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">
                写真を選択
              </p>
              <p className="text-sm text-gray-600">
                JPEGまたはPNG • 最大{formatFileSize(maxFileSize)}
              </p>
            </div>
            <Button 
              type="button" 
              variant="outline"
              disabled={disabled}
              size="sm"
              className="w-full max-w-[200px]"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              ファイルを選択
            </Button>
          </div>
          
          {disabled && (
            <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">アップロード中...</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors - Mobile Optimized */}
      {validationErrors.length > 0 && showErrorSummary && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                アップロードエラー
                {getErrorSummary(validationErrors) && (
                  <span className="font-normal ml-2">
                    ({getErrorSummary(validationErrors)})
                  </span>
                )}
              </h4>
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    {error.message}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValidationErrors([])}
                className="mt-3 h-8 text-xs border-red-300 text-red-700 hover:bg-red-100"
              >
                エラーを閉じる
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Images Grid - Responsive */}
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 md:text-base">
              <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
              選択中の写真 ({uploadedImages.length}枚)
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllImages}
              disabled={isProcessing}
              className="text-xs h-8 px-3 md:text-sm md:h-auto md:px-4"
            >
              <X className="h-3 w-3 mr-1 md:h-4 md:w-4" />
              全削除
            </Button>
          </div>
          
          {/* Responsive Grid - 3 columns on mobile, 4-5 on desktop */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg">
                  <p className="truncate">{image.name}</p>
                  <p className="text-xs opacity-80">{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}