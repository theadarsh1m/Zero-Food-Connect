
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser, // Added for account deletion
  updateProfile as firebaseUpdateProfile, // Can be used for Auth profile, but we primarily use Firestore
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Added updateDoc, deleteDoc
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Added for profile picture
import { auth, db, storage } from "@/lib/firebase";
import type { User, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loadingAuth: boolean; // For initial auth state check
  loadingAction: boolean; // For login/signup/logout/update actions
  error: string | null;
  signupWithEmail: (email: string, pass: string, name: string, role: Role) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProfileName: (newName: string) => Promise<void>; // New
  updateUserProfilePicture: (file: File) => Promise<void>; // New
  deleteUserAccount: () => Promise<void>; // New
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as User);
        } else {
          setUserData(null);
          console.warn("User document not found in Firestore for UID:", user.uid);
        }
      } else {
        setUserData(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const signupWithEmail = async (email: string, pass: string, name: string, role: Role) => {
    setLoadingAction(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const userToSave: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        role,
        profilePictureUrl: null, // Initialize
        phoneNumber: null,       // Initialize
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userToSave);
      toast({ title: "Signup Successful", description: "Welcome!" });
      router.push(`/${role}`); 
    } catch (e: any) {
      console.error("Signup error:", e);
      let errorMessage = "Failed to sign up. Please try again.";
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please try logging in or use a different email.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoadingAction(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const fetchedUserData = userDocSnap.data() as User;
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(`/${fetchedUserData.role}`); 
      } else {
        console.error(`User document not found in Firestore for UID: ${firebaseUser.uid}.`);
        await firebaseSignOut(auth);
        const specificErrorMsg = "Your user profile data is incomplete. Please try signing up again or contact support.";
        setError(specificErrorMsg); 
        toast({ title: "Login Issue", description: specificErrorMsg, variant: "destructive", duration: 7000 });
        return;
      }
    } catch (e: any) {
      console.error("Login error caught:", e);
      let errorMessage = "An unexpected error occurred during login. Please try again.";
      if (e.code) {
        switch (e.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts.";
            break;
          default:
            errorMessage = e.message || "An unknown error occurred.";
        }
      } else if (e.message) {
        errorMessage = e.message;
      }
      if (e.message === "Failed to get document because the client is offline.") {
          errorMessage = "Failed to connect. Please check your internet connection.";
      }
      setError(errorMessage);
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const logoutUser = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login"); 
    } catch (e: any) {
      console.error("Logout error:", e);
      setError(e.message || "Failed to log out.");
      toast({ title: "Logout Failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const updateUserProfileName = async (newName: string) => {
    if (!currentUser || !userData) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { name: newName });
      setUserData(prev => prev ? { ...prev, name: newName } : null);
      toast({ title: "Success", description: "Your name has been updated." });
    } catch (e: any) {
      console.error("Update name error:", e);
      setError(e.message || "Failed to update name.");
      toast({ title: "Update Failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const updateUserProfilePicture = async (file: File) => {
    if (!currentUser || !userData) {
      toast({ title: "Error", description: "You must be logged in to update your profile picture.", variant: "destructive" });
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      // Delete old profile picture if it exists
      if (userData.profilePictureUrl) {
        try {
          // Derive path from URL - This is a simplistic approach and might need adjustment
          // based on how you store paths or if you store paths separately.
          // Assuming URL is like https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/profile_pictures%2FUSER_ID%2FFILE_NAME?alt=media
          // This is fragile. Better to store the storage path in Firestore if you need to delete.
          // For simplicity, if the URL structure is consistent:
          const oldImagePath = `profile_pictures/${currentUser.uid}/${userData.profilePictureUrl.split('%2F').pop()?.split('?')[0]}`;
          if (oldImagePath.includes(currentUser.uid)) { // Basic check
            const oldImageRef = storageRef(storage, oldImagePath);
            // await deleteObject(oldImageRef); // Commented out due to path fragility
          }
        } catch (deleteError) {
          console.warn("Could not delete old profile picture:", deleteError);
          // Non-fatal, continue with upload
        }
      }
      
      const imagePath = `profile_pictures/${currentUser.uid}/${file.name}`;
      const imageRef = storageRef(storage, imagePath);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { profilePictureUrl: downloadURL });
      setUserData(prev => prev ? { ...prev, profilePictureUrl: downloadURL } : null);

      toast({ title: "Success", description: "Profile picture updated." });
    } catch (e: any)
      {
      console.error("Update profile picture error:", e);
      setError(e.message || "Failed to update profile picture.");
      toast({ title: "Update Failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteUserAccount = async () => {
    if (!currentUser) {
      toast({ title: "Error", description: "No user is currently logged in.", variant: "destructive" });
      return;
    }
    setLoadingAction(true);
    setError(null);
    try {
      // 1. Delete Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);
      await deleteDoc(userDocRef);

      // 2. Delete user from Firebase Authentication
      // This operation is sensitive and might require recent sign-in.
      // If it fails, user might need to re-authenticate.
      await firebaseDeleteUser(currentUser);
      
      // No need to setCurrentUser(null) or setUserData(null) as onAuthStateChanged will trigger
      toast({ title: "Account Deleted", description: "Your account has been successfully deleted." });
      router.push("/signup"); // Redirect to signup or home page
    } catch (e: any) {
      console.error("Delete account error:", e);
      let userMessage = e.message || "Failed to delete account.";
      if (e.code === "auth/requires-recent-login") {
        userMessage = "This operation is sensitive and requires recent authentication. Please log out and log back in, then try again.";
      }
      setError(userMessage);
      toast({ title: "Deletion Failed", description: userMessage, variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };


  const value = {
    currentUser,
    userData,
    loadingAuth,
    loadingAction,
    error,
    signupWithEmail,
    loginWithEmail,
    logoutUser,
    updateUserProfileName,
    updateUserProfilePicture,
    deleteUserAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
