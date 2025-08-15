"use client";

import { useEffect, useState, useTransition } from "react";
import { getSessionImages, deleteSession, deleteImageFromSession } from "@/app/step1/action";

export type SessionImage = {
  id: string;
  url: string;
  original_filename?: string;
  file_size?: number;
  stored_filename?: string;
};

export function useSessionImages(initialToken: string | null) {
  const [activeToken, setActiveToken] = useState<string | null>(initialToken);
  const [sessionImages, setSessionImages] = useState<SessionImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const refresh = (token = activeToken) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    getSessionImages(token)
      .then((res) => {
        if (res.success && res.images) {
          setSessionImages(
            res.images.map((img: any) => ({
              id: img.id ?? img.stored_filename,
              url: img.url,
              original_filename: img.original_filename,
              file_size: img.file_size,
              stored_filename: img.stored_filename,
            }))
          );
        } else {
          setSessionImages([]);
          if (res.error) setError(res.error);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (activeToken) refresh(activeToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken]);

  const removeOne = (filenameOrId: string) =>
    new Promise<boolean>((resolve) => {
      if (!activeToken) return resolve(false);
      const filename = filenameOrId;
      startTransition(async () => {
        const res = await deleteImageFromSession(activeToken, filename);
        if (res.success) {
          setSessionImages((prev) => prev.filter((img) => img.id !== filename && img.stored_filename !== filename));
          resolve(true);
        } else {
          setError(res.error || "画像の削除に失敗しました");
          resolve(false);
        }
      });
    });

  const removeAll = () =>
    new Promise<boolean>((resolve) => {
      if (!activeToken) return resolve(false);
      startTransition(async () => {
        const res = await deleteSession(activeToken);
        if (res.success) {
          setSessionImages([]);
          setActiveToken(null);
          resolve(true);
        } else {
          setError(res.error || "サーバー画像の削除に失敗しました");
          resolve(false);
        }
      });
    });

  return {
    activeToken,
    setActiveToken,
    sessionImages,
    isLoading,
    isPending,
    error,
    refresh,
    removeOne,
    removeAll,
  } as const;
}


