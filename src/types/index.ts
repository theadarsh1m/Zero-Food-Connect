
import type { Timestamp } from "firebase/firestore"; // Import Timestamp

export type Role = "donor" | "recipient" | "volunteer" | "admin";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: Role;
}

export interface FoodPost {
  id?: string; // Firestore document ID, will be set after creation or if needed client-side
  donorId: string;
  donorName?: string; // Store donor's name for easier display
  foodType: string;
  quantity: string;
  location: string; // Could be more structured (e.g., address object) or GeoPoint later
  pickupInstructions?: string;
  expiryDate: Timestamp; // Store as Firestore Timestamp
  imageUrl?: string; // Public URL of the image in Firebase Storage
  imagePath?: string; // Path to the image in Firebase Storage (for deletion/management)
  postedAt: Timestamp; // Store as Firestore Timestamp
  status: "available" | "requested" | "fulfilled" | "expired";
}

export interface PickupRequest {
  id: string;
  foodPostId: string;
  recipientId: string;
  volunteerId?: string | null;
  requestedAt: Timestamp; // Changed to Timestamp
  status: "pending_pickup" | "assigned_to_volunteer" | "fulfilled" | "cancelled";
  fulfilledAt?: Timestamp; // Changed to Timestamp
}

export interface ImpactStats {
  totalMealsServed: number;
  kgFoodSaved: number;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[];
}
