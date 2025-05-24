import AppHeader from "@/components/layout/AppHeader";
import type React from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
