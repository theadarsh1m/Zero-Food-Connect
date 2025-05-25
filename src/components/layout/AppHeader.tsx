
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
  Settings, // Added Settings icon
  LogIn,
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import type { NavItem } from "@/types";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; 
import Image from "next/image"; // For profile picture

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["donor", "recipient", "volunteer", "admin"] },
  { href: "/donor", label: "My Donations Hub", icon: CookingPot, roles: ["donor"] },
  { href: "/recipient", label: "Find Food Hub", icon: Search, roles: ["recipient"] },
  { href: "/volunteer", label: "Pickup Hub", icon: HandHelping, roles: ["volunteer"] },
  { href: "/donate", label: "Post New Donation", icon: CookingPot, roles: ["donor"] },
  { href: "/browse", label: "Browse Available Food", icon: Search, roles: ["recipient", "volunteer", "donor", "admin"] }, // All roles can browse
  { href: "/pickups", label: "Available Pickups", icon: HandHelping, roles: ["volunteer"] },
  { href: "/history", label: "Activity History", icon: History, roles: ["donor", "recipient", "volunteer", "admin"] },
  { href: "/tips", label: "AI Food Tips", icon: Lightbulb, roles: ["donor", "recipient", "volunteer", "admin"] },
];


export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter(); // For navigation
  const { currentUser, userData, logoutUser, loadingAuth } = useAuth();

  const accessibleNavItems = navItems.filter(item => {
    if (loadingAuth) return false; 
    if (!currentUser || !userData?.role) {
        // Allow browsing and tips if not fully logged in, or if role is missing
        return item.href === "/tips" || item.href === "/browse";
    }
    return !item.roles || item.roles.includes(userData.role);
  });


  const UserAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          {userData?.profilePictureUrl ? (
            <Image 
              src={userData.profilePictureUrl} 
              alt={userData.name || "User profile"}
              fill
              className="rounded-full object-cover"
              sizes="40px"
            />
          ) : (
            <UserCircle className="h-8 w-8" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email || "user@example.com"}
            </p>
             <p className="text-xs leading-none text-muted-foreground capitalize">
              Role: {userData?.role || "Unknown"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logoutUser}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={currentUser && userData?.role ? `/${userData.role}` : "/dashboard"} className="flex items-center space-x-2">
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
          {loadingAuth ? (
             <UserCircle className="h-8 w-8 text-muted-foreground animate-pulse" />
          ) : currentUser && userData ? ( // Ensure userData is also present
            <div className="hidden md:block">
              <UserAvatar />
            </div>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              {currentUser && userData && (
                 <div className="p-4 border-b flex items-center gap-3">
                    {userData?.profilePictureUrl ? (
                        <Image 
                        src={userData.profilePictureUrl} 
                        alt={userData.name || "User profile"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        />
                    ) : (
                        <UserCircle className="h-10 w-10" />
                    )}
                    <div>
                        <p className="text-sm font-medium leading-none">{userData?.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                        Role: {userData?.role}
                        </p>
                    </div>
                 </div>
              )}
              <nav className="flex flex-col space-y-1 p-4">
                {accessibleNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                ))}
                {currentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <SheetClose asChild>
                      <Link
                          href="/settings" 
                          className={cn(
                            "flex items-center space-x-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-foreground"
                          )}
                        >
                          <Settings className="mr-2 h-5 w-5" />
                          <span>Settings</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={logoutUser} className="w-full justify-start text-base font-medium mt-2">
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>Log out</span>
                      </Button>
                    </SheetClose>
                  </>
                )}
                {!currentUser && !loadingAuth && (
                   <SheetClose asChild>
                     <Link
                        href="/login"
                        className={cn(
                          "flex items-center space-x-2 rounded-md p-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === "/login" ? "bg-accent text-accent-foreground" : "text-foreground"
                        )}
                      >
                        <LogIn className="mr-2 h-5 w-5" />
                        <span>Login</span>
                      </Link>
                   </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
