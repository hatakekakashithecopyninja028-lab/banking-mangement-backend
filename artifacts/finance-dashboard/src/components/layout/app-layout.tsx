import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Receipt, Users, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["viewer", "analyst", "admin"] },
    { href: "/records", label: "Records", icon: Receipt, roles: ["analyst", "admin"] },
    { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
    { href: "/profile", label: "Profile", icon: UserCircle, roles: ["viewer", "analyst", "admin"] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-64 flex flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold tracking-tight">FinCommand</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">{user.role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                location === item.href 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
