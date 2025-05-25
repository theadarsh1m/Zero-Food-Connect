
import type { Timestamp } from "firebase/firestore"; // Import Timestamp

export type Role = "donor" | "recipient" | "volunteer" | "admin";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: Role;
  photoURL?: string | null; // Changed from profilePictureUrl
  phoneNumber?: string | null;
}

export interface FoodPost {
  id?: string; // Firestore document ID, will be set after creation or if needed client-side
  donorId: string;
  donorName?: string; // Store donor's name for easier display
  foodType: string;
  quantity: string;
  location: string; // Textual address or description
  latitude?: number; // Optional latitude
  longitude?: number; // Optional longitude
  pickupInstructions?: string;
  expiryDate: Timestamp; // Store as Firestore Timestamp
  imageUrl?: string; // Public URL of the image in Firebase Storage
  imagePath?: string; // Path to the image in Firebase Storage (for deletion/management)
  postedAt: Timestamp; // Store as Firestore Timestamp
  status: "available" | "requested" | "fulfilled" | "expired";
  requestedByUid?: string; // UID of the recipient who requested this item
  requestedAt?: Timestamp; // Timestamp when the item was requested
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
