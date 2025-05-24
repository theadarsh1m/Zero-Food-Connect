
"use client"; // Required because we use hooks like usePathname, useRouter, useAuth

import AppHeader from "@/components/layout/AppHeader";
import type React from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      // Allow access to /tips even if not fully logged in, as per current nav structure
      // Or, if you want /tips to be protected, remove this condition.
      // For now, assuming all /app/* routes require login.
      router.push("/login");
    }
  }, [currentUser, loadingAuth, router, pathname]);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser && !loadingAuth) {
     // This case should ideally be caught by useEffect pushing to /login
     // but as a fallback, prevent rendering children.
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="py-6 border-t bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          ZeroWaste Connect &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}


export default function AppLayoutWrapper({children}: {children: React.ReactNode}) {
  return (
    <AuthProvider>
      <ProtectedAppLayout>{children}</ProtectedAppLayout>
    </AuthProvider>
  )
}
