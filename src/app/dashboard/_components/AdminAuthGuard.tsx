"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/auth/sign-in");
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#07192b] text-slate-200 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
