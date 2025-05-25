
"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit3, Image as ImageIcon, Shield, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NextImage from "next/image";


export default function SettingsPage() {
  const { 
    currentUser, 
    userData, 
    loadingAuth, 
    loadingAction, 
    updateUserProfileName, 
    updateUserProfilePicture,
    deleteUserAccount 
  } = useAuth();
  const { toast } = useToast();

  const [name, setName] = React.useState(userData?.name || "");
  const [profilePictureFile, setProfilePictureFile] = React.useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(userData?.profilePictureUrl || null);

  React.useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setProfilePicturePreview(userData.profilePictureUrl || null);
    }
  }, [userData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Name cannot be empty.", variant: "destructive" });
      return;
    }
    await updateUserProfileName(name.trim());
  };

  const handleUpdateProfilePicture = async () => {
    if (!profilePictureFile) {
      toast({ title: "No Image", description: "Please select an image file to upload.", variant: "destructive" });
      return;
    }
    await updateUserProfilePicture(profilePictureFile);
    setProfilePictureFile(null); // Reset file input after upload attempt
  };
  
  const handleDeleteAccount = async () => {
    await deleteUserAccount();
    // AlertDialog will close, navigation handled by AuthContext
  };

  if (loadingAuth || !currentUser || !userData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account details, preferences, and security settings.
        </p>
      </div>

      {/* Account Information Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>View and update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePicturePreview || undefined} alt={userData.name || "User"} data-ai-hint="profile avatar" />
                <AvatarFallback>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="profilePictureInput" className="cursor-pointer text-sm text-primary hover:underline">
                Change Picture
              </Label>
              <Input 
                id="profilePictureInput" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleProfilePictureChange}
                disabled={loadingAction}
              />
              {profilePictureFile && (
                <Button onClick={handleUpdateProfilePicture} size="sm" disabled={loadingAction} className="mt-2">
                  {loadingAction ? <Loader2 className="animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />} Upload New
                </Button>
              )}
            </div>
            <div className="space-y-4 flex-grow w-full">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="flex gap-2">
                  <Input id="fullName" value={name} onChange={handleNameChange} disabled={loadingAction} />
                  <Button onClick={handleUpdateName} disabled={loadingAction || name === userData.name}>
                    {loadingAction && name !== userData.name ? <Loader2 className="animate-spin" /> : <Edit3 className="mr-2 h-4 w-4" />} Update Name
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email Address</Label>
                <Input value={userData.email || "Not available"} disabled />
                <p className="text-xs text-muted-foreground">Email address cannot be changed here. Contact support for assistance.</p>
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Input value={userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} disabled />
              </div>
               <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input id="phoneNumber" placeholder="e.g., +1 555-123-4567" value={userData.phoneNumber || ""} disabled />
                 <p className="text-xs text-muted-foreground">Phone number management coming soon.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-2">
              To change your password, we'll send a reset link to your registered email address.
            </p>
            <Button variant="outline" onClick={() => auth.sendPasswordResetEmail(currentUser.email!)} disabled={loadingAction || !currentUser?.email}>
              {loadingAction ? <Loader2 className="animate-spin" /> : null} Send Password Reset Email
            </Button>
          </div>
          <div className="pt-4 border-t">
             <h3 className="font-medium text-destructive mb-1">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loadingAction}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={loadingAction}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={loadingAction} className="bg-destructive hover:bg-destructive/90">
                    {loadingAction ? <Loader2 className="animate-spin" /> : null} Yes, delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for other sections */}
      <Card className="shadow-md opacity-50">
        <CardHeader>
          <CardTitle>More Settings Coming Soon</CardTitle>
          <CardDescription>Location preferences, notifications, and activity overview will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">We are working on bringing more features to this page. Stay tuned!</p>
        </CardContent>
      </Card>

    </div>
  );
}
