
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail, // Added for password reset
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import type { User, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loadingAuth: boolean;
  loadingAction: boolean;
  error: string | null;
  signupWithEmail: (email: string, pass: string, name: string, role: Role) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProfileName: (newName: string) => Promise<void>;
  updateUserProfilePicture: (file: File) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  sendPasswordResetLink: (email: string) => Promise<void>; // Added
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
          // Potentially log out user if their Firestore record is essential and missing
          // await firebaseSignOut(auth); 
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
        photoURL: null, // Changed from profilePictureUrl
        phoneNumber: null,
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userToSave);
      setUserData(userToSave); // Set user data immediately
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
        setUserData(fetchedUserData); // Set user data immediately
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(`/${fetchedUserData.role}`); 
      } else {
        console.error(`User document not found in Firestore for UID: ${firebaseUser.uid}. Logging out.`);
        await firebaseSignOut(auth); // Log out user if their Firestore profile is missing
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
      setCurrentUser(null); // Clear current user
      setUserData(null);    // Clear user data
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
      // New uploads will overwrite the file at this specific path.
      const imagePath = `user_profiles/${currentUser.uid}/profile.jpg`; // Fixed path as requested
      const imageRef = storageRef(storage, imagePath);
      
      // Upload the file, Firebase Storage will use the contentType from the File object if not specified,
      // or you can specify it like: { contentType: file.type }
      await uploadBytes(imageRef, file, { contentType: file.type });
      const downloadURL = await getDownloadURL(imageRef);

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL }); // Changed to photoURL
      setUserData(prev => prev ? { ...prev, photoURL: downloadURL } : null); // Changed to photoURL

      toast({ title: "Success", description: "Profile picture updated." });
    } catch (e: any) {
      console.error("Update profile picture error:", e);
      setError(e.message || "Failed to update profile picture.");
      toast({ title: "Update Failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };
  
  const sendPasswordResetLink = async (email: string) => {
    if (!email) {
        toast({ title: "Error", description: "Email is required.", variant: "destructive"});
        return;
    }
    setLoadingAction(true);
    setError(null);
    try {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Password Reset Email Sent", description: "Check your inbox for a password reset link."});
    } catch (e: any) {
        console.error("Password reset error:", e);
        setError(e.message || "Failed to send password reset email.");
        toast({ title: "Error", description: e.message || "Failed to send reset link.", variant: "destructive"});
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

      // Optional: Delete user's profile picture from Storage
      try {
        const imagePath = `user_profiles/${currentUser.uid}/profile.jpg`;
        const imageRefToDelete = storageRef(storage, imagePath);
        await deleteObject(imageRefToDelete);
      } catch (storageError: any) {
        // If the file doesn't exist or another error occurs, log it but don't block account deletion.
        if (storageError.code !== 'storage/object-not-found') {
            console.warn("Could not delete profile picture during account deletion:", storageError);
        }
      }
      
      // 2. Delete user from Firebase Authentication
      await firebaseDeleteUser(currentUser);
      
      // Auth state will change via onAuthStateChanged, which will update currentUser and userData
      toast({ title: "Account Deleted", description: "Your account has been successfully deleted." });
      // No need to push here, onAuthStateChanged will lead to ProtectedAppLayout redirecting if currentUser becomes null
    } catch (e: any) {
      console.error("Delete account error:", e);
      let userMessage = e.message || "Failed to delete account.";
      if (e.code === "auth/requires-recent-login") {
        userMessage = "This operation is sensitive and requires recent authentication. Please log out and log back in, then try again.";
      }
      setError(userMessage);
      toast({ title: "Deletion Failed", description: userMessage, variant: "destructive" });
      // If deletion fails, user is still logged in. Don't clear state here.
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
    sendPasswordResetLink,
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
