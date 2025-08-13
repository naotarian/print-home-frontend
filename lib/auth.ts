import { cookies } from "next/headers";

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
};

/**
 * ログイン中のユーザー情報を取得（User or Admin）
 * middlewareで認証済みのページで呼び出し想定
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("api_token")?.value;
  const apiBase = process.env.API_URL;

  if (!token || !apiBase) {
    return null;
  }

  try {
    const res = await fetch(`${apiBase}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store", // 常に最新の情報を取得
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * ユーザー（User）のみの情報を取得
 * middlewareでuser.only保護されたページで呼び出し想定
 */
export async function getCurrentUserOnly(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("api_token")?.value;
  const apiBase = process.env.API_URL;

  if (!token || !apiBase) {
    return null;
  }

  try {
    const res = await fetch(`${apiBase}/api/user/only`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}