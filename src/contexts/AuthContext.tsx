
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
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as User);
        } else {
          // This case might happen if Firestore data wasn't created or user was deleted
          // For now, we'll clear userData, you might want to handle this differently
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
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userToSave);
      setCurrentUser(firebaseUser); // onAuthStateChanged will also trigger, but this is faster UI update
      setUserData(userToSave);
      toast({ title: "Signup Successful", description: "Welcome!" });
      router.push(`/${role}`); // Redirect to role-based dashboard
    } catch (e: any) {
      console.error("Signup error:", e);
      setError(e.message || "Failed to sign up.");
      toast({ title: "Signup Failed", description: e.message || "Please try again.", variant: "destructive" });
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
      // Fetch user data from Firestore (onAuthStateChanged will also do this, but good for immediate feedback)
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const fetchedUserData = userDocSnap.data() as User;
        setCurrentUser(firebaseUser);
        setUserData(fetchedUserData);
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(`/${fetchedUserData.role}`); // Redirect to role-based dashboard
      } else {
        // Should not happen if signup flow is correct
        throw new Error("User data not found. Please contact support.");
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "Failed to log in.");
      toast({ title: "Login Failed", description: e.message || "Invalid credentials or user data missing.", variant: "destructive" });
    } finally {
      setLoadingAction(false);
    }
  };

  const logoutUser = async () => {
    setLoadingAction(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/login"); // Redirect to login page
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
