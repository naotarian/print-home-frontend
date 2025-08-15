"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Upload as UploadIcon, Camera, ImageIcon, Trash2 } from "lucide-react";
import ImageUploadForm from "@/components/forms/ImageUploadForm";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { type UploadedImage } from "@/lib/imageValidation";
import { PRINT_HOME_STEPS, STEP_PATHS } from "@/lib/steps";
import { uploadImages, redirectToStep2 } from "./action";
import { useSessionImages } from "@/hooks/useSessionImages";
import SessionImageGrid from "@/components/session/SessionImageGrid";

export default function Step1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { activeToken, setActiveToken, sessionImages, isPending: isSessionPending, removeAll, removeOne } = useSessionImages(initialToken);
  const MAX_TOTAL = 20;
  const combinedCount = sessionImages.length + uploadedImages.length;

  const handleNext = () => {
    // 既存トークンがあり、追加アップロードが無い場合はそのままStep2へ
    if (uploadedImages.length === 0 && activeToken) {
      startTransition(async () => {
        await redirectToStep2(activeToken);
      });
      return;
    }

    if (uploadedImages.length === 0) return;

    startTransition(async () => {
      let redirectToken = '';
      
      try {
        setUploadError(null);
        
        // FormDataを作成
        const formData = new FormData();
        uploadedImages.forEach(img => {
          formData.append('images', img.file);
        });

        // 既存セッショントークンがあれば付与（追加入稿）
        if (activeToken) {
          formData.append('existing_token', activeToken);
        }

        const result = await uploadImages(null, formData);
        
        if (result.success) {
          setActiveToken(result.token || null);
          setUploadedImages([]);
          if (result.token) {
            redirectToken = result.token;
          }
        } else {
          setUploadError(result.error || 'アップロードに失敗しました');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('アップロード中にエラーが発生しました');
      }
      
      // try...catchブロックの外でredirectを実行
      if (redirectToken) {
        await redirectToStep2(redirectToken);
      }
    });
  };

  const handleClearServerImages = () => {
    if (!activeToken) return;
    if (!confirm('サーバーに保存済みの画像をすべて削除します。よろしいですか？')) return;
    removeAll().then((ok) => {
      if (ok) router.replace(STEP_PATHS.STEP1);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - only visible on mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(STEP_PATHS.HOME)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">写真アップロード</h1>
              <p className="text-xs text-gray-500">Step 1 / 4</p>
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Desktop Header - only visible on desktop */}
      <header className="bg-white border-b border-gray-200 hidden md:block">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(STEP_PATHS.HOME)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              ホームに戻る
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">Step 1</h1>
              <p className="text-sm text-gray-600">{PRINT_HOME_STEPS[0].title}</p>
            </div>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Progress Indicator - Responsive */}
      <div className="bg-white border-b border-gray-100">
        <div className="md:hidden">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={0} variant="mobile" />
        </div>
        <div className="hidden md:block">
          <ProgressIndicator steps={PRINT_HOME_STEPS} currentStep={0} variant="default" />
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <main className="px-4 py-6 space-y-6 md:mx-auto md:max-w-4xl md:py-8">
        {/* Mobile Status Card - only visible on mobile */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {combinedCount === 0 ? '写真を選択してください' : `${combinedCount}枚選択中`}
                </p>
                <p className="text-xs text-gray-500">最大20枚まで</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{combinedCount}</div>
              <div className="text-xs text-gray-400">/ {MAX_TOTAL}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>進捗</span>
              <span>{Math.round((combinedCount / MAX_TOTAL) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(combinedCount / MAX_TOTAL) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Title Section - only visible on desktop */}
        <div className="text-center hidden md:block">
          <h2 className="text-2xl font-bold text-gray-900">写真をアップロードしてください</h2>
          <p className="mt-2 text-gray-600">
            {PRINT_HOME_STEPS[0].description}（現在：{combinedCount}/{MAX_TOTAL}枚）
          </p>
        </div>

        {/* Upload Error Display - Responsive */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-100 rounded-full md:hidden">
                <div className="h-3 w-3 bg-red-500 rounded-full" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-red-800 md:mb-1">
                  <div className="text-sm font-medium">アップロードエラー</div>
                </div>
                <div className="text-sm text-red-700">
                  {uploadError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Images - Responsive Layout */}
        {sessionImages.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:bg-transparent md:shadow-none md:border-none md:p-0">
            <SessionImageGrid
              images={sessionImages}
              busy={isSessionPending}
              onRemoveAll={handleClearServerImages}
              onRemoveOne={(filename) => {
                if (!activeToken) return;
                removeOne(filename);
              }}
            />
          </div>
        )}

        {/* Upload Form - Responsive */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 md:bg-transparent md:shadow-none md:border-none md:p-0">
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <Camera className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">新しい写真を追加</h3>
          </div>
          <ImageUploadForm
            uploadedImages={uploadedImages}
            onImagesChange={setUploadedImages}
            disabled={isPending}
          />
        </div>

        {/* Mobile Tips - only visible on mobile */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 md:hidden">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            写真選択のコツ
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• スマホのカメラロールから直接選択できます</li>
            <li>• カメラで撮影してその場でアップロードも可能</li>
            <li>• JPEGとPNG形式に対応しています</li>
            <li>• 高画質な写真ほど美しい仕上がりになります</li>
          </ul>
        </div>

        {/* Desktop Navigation - only visible on desktop */}
        <div className="hidden md:flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => router.push(STEP_PATHS.HOME)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>

          <Button
            onClick={handleNext}
            disabled={(uploadedImages.length === 0 && !activeToken) || isPending}
            className="flex items-center gap-2"
            size="lg"
          >
            {isPending ? (
              <>
                <UploadIcon className="h-4 w-4 animate-spin" />
                アップロード中...
              </>
            ) : (
              <>
                次へ進む ({sessionImages.length + uploadedImages.length}/{MAX_TOTAL})
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Mobile Bottom Action Bar - only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom md:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(STEP_PATHS.HOME)}
            className="flex-1 h-12"
          >
            戻る
          </Button>

          <Button
            onClick={handleNext}
            disabled={(uploadedImages.length === 0 && !activeToken) || isPending}
            className="flex-1 h-12 text-base font-medium"
            size="lg"
          >
            {isPending ? (
              <>
                <UploadIcon className="h-4 w-4 animate-spin mr-2" />
                アップロード中...
              </>
            ) : (
              <>
                次へ進む
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {/* Progress Summary for Bottom Bar */}
        {combinedCount > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              {combinedCount}枚選択済み • 次のステップでお客様情報を入力します
            </p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Padding - only for mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}