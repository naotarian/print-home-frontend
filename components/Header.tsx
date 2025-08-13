import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server Action: ログアウト処理
export async function logout() {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("api_token")?.value;
  const apiBase = process.env.API_URL;

  if (apiBase && token) {
    try {
      await fetch(`${apiBase}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch {}
  }

  cookieStore.delete("api_token");
  redirect("/auth/login");
}

export default async function Header() {
  const cookieStore = await cookies();
  const token = cookieStore.get("api_token")?.value;

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Next Start Template
        </Link>
        <nav>
          {token ? (
            <form action={logout}>
              <button
                type="submit"
                className="rounded bg-black text-white px-3 py-1 text-sm"
              >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              href="/auth/login"
              className="rounded border border-gray-300 px-3 py-1 text-sm"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}


