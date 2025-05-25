
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
  LogIn,
  Truck, // Added for volunteer specific hub
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
import { usePathname, useRouter } from "next/navigation"; 
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; 
import Image from "next/image"; 

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["donor", "recipient", "volunteer", "admin"] },
  { href: "/donor", label: "Donor Hub", icon: CookingPot, roles: ["donor"] },
  { href: "/recipient", label: "Recipient Hub", icon: Search, roles: ["recipient"] },
  { href: "/volunteer", label: "Volunteer Hub", icon: Truck, roles: ["volunteer"] },
  // Removed duplicate/conflicting entries like /donate and /browse from main navItems
  // These are better accessed from within role-specific hubs or a general "Actions" menu if needed.
  { href: "/history", label: "Activity History", icon: History, roles: ["donor", "recipient", "volunteer", "admin"] },
  { href: "/tips", label: "AI Food Tips", icon: Lightbulb, roles: ["donor", "recipient", "volunteer", "admin"] },
];


export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter(); 
  const { currentUser, userData, logoutUser, loadingAuth } = useAuth();

  const accessibleNavItems = navItems.filter(item => {
    if (loadingAuth) return false; 
    if (!currentUser || !userData?.role) {
        return item.href === "/tips"; // Only allow tips if not fully logged in or role unknown
    }
    return !item.roles || item.roles.includes(userData.role);
  });


  const UserAvatar = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          {userData?.photoURL ? ( // Changed to photoURL
            <Image 
              src={userData.photoURL} 
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
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logoutUser}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getHomeLink = () => {
    if (loadingAuth) return "/"; // Default if still loading
    if (currentUser && userData?.role) {
      return `/${userData.role}`; // e.g., /donor, /recipient
    }
    return "/dashboard"; // Fallback for general dashboard or if role is not specific
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={getHomeLink()} className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ZeroWaste Connect</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {accessibleNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              asChild
              size="sm"
            >
              <Link
                href={item.href}
                className="text-sm font-medium"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          {loadingAuth ? (
             <UserCircle className="h-8 w-8 text-muted-foreground animate-pulse" />
          ) : currentUser && userData ? ( 
            <div className="hidden md:block">
              <UserAvatar />
            </div>
          ) : (
            <Button variant="outline" asChild size="sm">
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
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              {currentUser && userData && (
                 <div className="p-4 border-b flex items-center gap-3">
                    {userData?.photoURL ? ( // Changed to photoURL
                        <Image 
                        src={userData.photoURL} 
                        alt={userData.name || "User profile"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        />
                    ) : (
                        <UserCircle className="h-10 w-10 text-muted-foreground" />
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
              <nav className="flex flex-col space-y-1 p-2">
                {accessibleNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                ))}
                {currentUser && (
                  <>
                    <DropdownMenuSeparator className="my-2"/>
                    <SheetClose asChild>
                      <Link
                          href="/settings" 
                          className={cn(
                            "flex items-center space-x-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-foreground"
                          )}
                        >
                          <Settings className="mr-0 h-5 w-5 flex-shrink-0" />
                          <span>Settings</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                       <Button
                        variant="ghost"
                        onClick={logoutUser}
                        className="w-full justify-start text-base font-medium mt-2 p-3 space-x-3"
                      >
                        <LogOut className="mr-0 h-5 w-5 flex-shrink-0" />
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
                          "flex items-center space-x-3 rounded-md p-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          pathname === "/login" ? "bg-accent text-accent-foreground" : "text-foreground"
                        )}
                      >
                        <LogIn className="mr-0 h-5 w-5 flex-shrink-0" />
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
