// app/(auth)/login/_actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(email: string, password: string) {
  const API_BASE = process.env.API_URL;
  console.log(API_BASE);
  // APIトークンログイン（Sanctum Personal Access Token）
  const loginRes = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    throw new Error("ログイン失敗");
  }

  const data = (await loginRes.json()) as { token: string };
  if (!data?.token) {
    throw new Error("トークンが返却されませんでした");
  }

  // Next.js 側の HttpOnly Cookie に保存（サーバーアクション/ルートで使用）
  (await cookies()).set("api_token", data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/");
}
