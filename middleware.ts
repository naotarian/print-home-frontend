import { NextResponse, type NextRequest } from "next/server";

// 認証が必要なパスのプレフィックス（必要に応じて調整してください）
const PROTECTED_PATHS: RegExp[] = [
//   /^\/$/, // トップページ
  /^\/dashboard(\/.*)?$/, // 例
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保護対象でなければスキップ
  const requiresAuth = PROTECTED_PATHS.some((re) => re.test(pathname));
  if (!requiresAuth) return NextResponse.next();

  const token = request.cookies.get("api_token")?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  // パスに応じて検証エンドポイントを切替
  //  - トップページ: ログイン済みであればOK（ユーザー/管理者どちらでも） -> /api/me
  //  - それ以外の例（/dashboard 等）: ユーザーのみ -> /api/user/only
  const apiBase = process.env.API_URL;
  if (!apiBase) {
    // API URL が未設定の場合は安全側でログインへ
    return redirectToLogin(request);
  }

  try {
    const verifyUrl = `${apiBase}/api/user/only`;
    const res = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/", // トップページ
    "/dashboard/:path*", // 例; PROTECTED_PATHS と同期してください
  ],
};


