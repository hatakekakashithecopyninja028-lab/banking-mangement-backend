import React from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Mail, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your current profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground capitalize flex items-center gap-1 mt-1">
                <Shield className="w-4 h-4" />
                {user.role} Access
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </p>
              <p className="font-medium">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Member Since
              </p>
              <p className="font-medium">{format(new Date(user.createdAt), 'MMMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t">
            <Button variant="destructive" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
