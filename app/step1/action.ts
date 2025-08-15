// @ts-nocheck
"use server";

import { redirect } from "next/navigation";

// API設定（サーバー間通信）
const API_BASE_URL = process.env.API_BASE_URL || "http://nginx";
// ブラウザからアクセス可能な公開APIベースURL（画像配信用のリダイレクト先）
const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// アップロード結果の型定義
interface UploadResult {
  success: boolean;
  token?: string;
  error?: string;
  imageCount?: number;
}

// 画像メタデータの型定義
interface ImageMetadata {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url?: string;
}

// APIレスポンスの型定義
interface ApiUploadResponse {
  success: boolean;
  token?: string;
  images?: ImageMetadata[];
  errors?: string[];
  session?: {
    id: string;
    token: string;
    image_count: number;
    total_size: string;
    expires_at: string;
    metadata: any;
    created_at: string;
    updated_at: string;
    uploaded_images: any[];
  };
  message?: string;
}

interface ApiSessionResponse {
  success: boolean;
  session?: {
    id: string;
    token: string;
    image_count: number;
    total_size: string;
    expires_at: string;
    metadata: any;
    created_at: string;
    updated_at: string;
  };
  images?: any[];
  error?: string;
  message?: string;
}

// APIコール用のヘルパー関数
async function makeApiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

// クライアントサイドバリデーション（APIコール前の事前チェック）
function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `${file.name}は対応していない形式です。JPGまたはPNG形式のファイルを選択してください。`,
    };
  }

  if (file.size > maxSize) {
    const sizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;
    return {
      isValid: false,
      error: `${file.name}のファイルサイズが大きすぎます（${sizeMB}MB）。10MB以下のファイルを選択してください。`,
    };
  }

  return { isValid: true };
}

/**
 * 画像をアップロードしてセッショントークンを生成するServer Action
 */
export async function uploadImages(
  prevState: UploadResult | null,
  formData: FormData
): Promise<UploadResult> {
  try {
    // FormDataから画像ファイルを取得
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return {
        success: false,
        error: "画像ファイルが選択されていません。",
      };
    }

    // 最大枚数チェック
    if (files.length > 20) {
      return {
        success: false,
        error: "画像は最大20枚まで選択可能です。",
      };
    }

    // クライアントサイドバリデーション
    const errors: string[] = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(" "),
      };
    }

    // Laravel APIにアップロード
    const apiFormData = new FormData();
    files.forEach(file => {
      apiFormData.append('images[]', file);
    });

    // 既存のセッションtokenがある場合は送信
    const existingToken = formData.get("existingToken") as string;
    if (existingToken) {
      apiFormData.append('existing_token', existingToken);
    }

    const response = await makeApiCall('/api/images/upload', {
      method: 'POST',
      body: apiFormData,
    });

    const result: ApiUploadResponse = await response.json();
    console.log(result);

    if (!result.success || !result.token) {
      return {
        success: false,
        error: result.message || result.errors?.join(', ') || "アップロードに失敗しました。",
      };
    }

    console.log(`Images uploaded successfully. Token: ${result.token}, Count: ${result.images?.length || 0}`);

    return {
      success: true,
      token: result.token,
      imageCount: result.images?.length || 0,
    };

  } catch (error) {
    console.error("Upload error:", error);
    
    // API エラーの詳細を取得
    if (error instanceof Error) {
      return {
        success: false,
        error: `アップロードエラー: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "画像のアップロード中にエラーが発生しました。もう一度お試しください。",
    };
  }
}

/**
 * セッショントークンから画像データを取得するServer Action
 */
export async function getSessionImages(token: string): Promise<{
  success: boolean;
  images?: ImageMetadata[];
  error?: string;
}> {
  try {
    if (!token) {
      return {
        success: false,
        error: "セッショントークンが指定されていません。",
      };
    }

    const response = await makeApiCall(`/api/images/session/${token}`, {
      method: 'GET',
    });

    const result: ApiSessionResponse = await response.json();
    console.log("getSessionImages result:", result);

    if (!result.success || !result.images) {
      return {
        success: false,
        error: result.error || result.message || "セッションが見つからないか、期限切れです。",
      };
    }

    // 画像にURL情報を追加
    const imagesWithUrl = result.images.map((image: any) => ({
      ...image,
      // クライアントが到達できる公開ベースURLを使用
      url: `${PUBLIC_API_BASE_URL}/api/images/file/${result.session?.token}/${image.stored_filename}`
    }));

    return {
      success: true,
      images: imagesWithUrl,
    };

  } catch (error) {
    console.error("Get session images error:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: `画像データ取得エラー: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "画像データの取得中にエラーが発生しました。",
    };
  }
}

/**
 * セッションを削除するServer Action
 */
export async function deleteSession(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!token) {
      return {
        success: false,
        error: "セッショントークンが指定されていません。",
      };
    }

    const response = await makeApiCall(`/api/images/session/${token}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    return {
      success: result.success || true,
      error: result.success ? undefined : result.message,
    };

  } catch (error) {
    console.error("Delete session error:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: `セッション削除エラー: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "セッションの削除中にエラーが発生しました。",
    };
  }
}

/**
 * セッション内の特定画像を削除するServer Action
 */
export async function deleteImageFromSession(token: string, filename: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await makeApiCall(`/api/images/file/${token}/${filename}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return {
      success: !!result.success,
      error: result.success ? undefined : result.error,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '画像削除中にエラーが発生しました。' };
  }
}

/**
 * Step2への遷移Action
 */
export async function redirectToStep2(token: string) {
  redirect(`/step2?token=${token}`);
}

export async function redirectToStep3(token: string) {
  redirect(`/step3?token=${token}`);
}
