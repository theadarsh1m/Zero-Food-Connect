
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loadingAuth: boolean; // For initial auth state check
  loadingAction: boolean; // For login/signup/logout actions
  error: string | null;
  signupWithEmail: (email: string, pass: string, name: string, role: Role) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
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
          console.warn("User document not found in Firestore for UID:", user.uid, "after auth state changed. This might happen if data was deleted or signup was incomplete.");
          // If user is authenticated but no Firestore doc, it's an issue.
          // Depending on app flow, might want to log them out here too or redirect to profile completion.
          // For now, just clearing userData. Login flow will handle a more direct error.
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
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userToSave);
      // setCurrentUser(firebaseUser); // onAuthStateChanged will handle this
      // setUserData(userToSave);     // onAuthStateChanged will handle this
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
        // setCurrentUser(firebaseUser); // onAuthStateChanged handles this
        // setUserData(fetchedUserData); // onAuthStateChanged handles this
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(`/${fetchedUserData.role}`); 
      } else {
        // User is authenticated with Firebase Auth, but their Firestore document is missing.
        console.error(`User document not found in Firestore for UID: ${firebaseUser.uid}. This often means the document was not created during signup, possibly due to Firestore security rules or a network issue during signup.`);
        await firebaseSignOut(auth); // Sign out the user. onAuthStateChanged will clear user state.
        
        const specificErrorMsg = "Your user profile data is incomplete. This can happen if signup didn't fully complete. Please try signing up again. If the problem persists, contact support.";
        setError(specificErrorMsg); 
        toast({
            title: "Login Issue",
            description: specificErrorMsg,
            variant: "destructive",
            duration: 7000 // Give more time to read this important message
        });
        return; // Exit the function here as we've handled this specific error case.
      }
    } catch (e: any) {
      console.error("Login error caught:", e);
      let errorMessage = "An unexpected error occurred during login. Please try again.";
      
      if (e.code) { // Firebase errors often have a 'code' property
        switch (e.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found': // user-not-found might be disabled depending on Firebase project settings
          case 'auth/invalid-credential': // More generic error for invalid email/password
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
            break;
          default:
            errorMessage = e.message || "An unknown error occurred.";
        }
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      if (e.message === "Failed to get document because the client is offline.") {
          errorMessage = "Failed to connect to the server. Please check your internet connection and try again."
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
      // setCurrentUser(null); // onAuthStateChanged handles this
      // setUserData(null);   // onAuthStateChanged handles this
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

  const value = {
    currentUser,
    userData,
    loadingAuth,
    loadingAction,
    error,
    signupWithEmail,
    loginWithEmail,
    logoutUser,
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

