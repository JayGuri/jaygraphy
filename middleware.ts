import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  // Ensure session is loaded / refreshed
  await supabase.auth.getSession();

  // Guard /upload routes
  if (req.nextUrl.pathname.startsWith("/upload")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Not logged in - redirect to login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const adminEmail =
      process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (session.user.email !== adminEmail) {
      // Logged in but not admin - redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/upload/:path*"],
};


