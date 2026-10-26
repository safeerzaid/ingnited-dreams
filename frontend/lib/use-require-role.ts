"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type UserRole } from "./auth-context";

/**
 * Redirects to login when signed out, or to the user's own home when the role is not allowed.
 * Returns true once the current user may see the page.
 */
export function useRequireRole(roles: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(user.role)) {
      router.replace(user.role === "ADMIN" ? "/admin" : user.role === "INSTRUCTOR" ? "/instructor/dashboard" : "/student/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, pathname, router]);

  return allowed;
}
