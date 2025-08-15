"use client";

import { Button } from "@/components/ui/button";
import { SessionImage } from "@/hooks/useSessionImages";

type Props = {
  images: SessionImage[];
  onRemoveOne: (filenameOrId: string) => void;
  onRemoveAll?: () => void;
  removable?: boolean;
  busy?: boolean;
};

export default function SessionImageGrid({ images, onRemoveOne, onRemoveAll, removable = true, busy = false }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 font-medium">サーバーに保存済みの画像（{images.length}枚）</div>
        {onRemoveAll && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={busy}
            onClick={onRemoveAll}
          >
            {busy ? "削除中…" : "保存済み画像をすべて削除"}
          </Button>
        )}
      </div>
      {/* Responsive Grid - 3 columns on mobile, original desktop layout */}
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {images.map((img) => {
          const filename = img.stored_filename || img.url.split("/").pop() || img.id;
          return (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img 
                src={img.url} 
                alt={img.original_filename || ""} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
              {removable && (
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                  title="削除"
                  onClick={() => onRemoveOne(filename)}
                  disabled={busy}
                >
                  ×
                </button>
              )}
              {/* Mobile: Always show filename overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg">
                <p className="truncate">{img.original_filename || filename}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


