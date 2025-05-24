"use client";

import Link from "next/link";
import {
  Leaf,
  LayoutDashboard,
  CookingPot,
  Search,
  HandHelping,
  History,
  Lightbulb,
  LogOut,
  UserCircle,
  Menu,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "@/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/use-auth"; // Placeholder for auth hook

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["donor", "recipient", "volunteer", "admin"] },
  { href: "/donate", label: "Donate Food", icon: CookingPot, roles: ["donor"] },
  { href: "/browse", label: "Browse Food", icon: Search, roles: ["recipient"] },
  { href: "/pickups", label: "Volunteer Pickups", icon: HandHelping, roles: ["volunteer"] },
  { href: "/history", label: "My History", icon: History, roles: ["donor", "recipient", "volunteer"] },
  { href: "/tips", label: "AI Food Tips", icon: Lightbulb, roles: ["donor", "recipient", "volunteer", "admin"] },
];

export default function AppHeader() {
  const pathname = usePathname();
  // const { user, logout } = useAuth(); // Placeholder
  const user = { name: "User Name", email: "user@example.com", role: "donor" }; // Mock user
  const logout = async () => console.log("Logout clicked"); // Mock logout

  // Filter nav items based on mock user role for now
  const accessibleNavItems = navItems.filter(item => !item.roles || item.roles.includes(user.role as any));


  const UserAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserCircle className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ZeroWaste Connect</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {accessibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            <UserAvatar />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {accessibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <DropdownMenuSeparator />
                 <Link
                    href="/settings" // Placeholder for settings page
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                       pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <Button variant="outline" onClick={logout} className="w-full justify-start text-base font-medium">
                     <LogOut className="mr-2 h-5 w-5" />
                     <span>Log out</span>
                  </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
