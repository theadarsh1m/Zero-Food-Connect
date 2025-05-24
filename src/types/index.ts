
export type Role = "donor" | "recipient" | "volunteer" | "admin";

export interface User {
  uid: string; // Changed from id to uid for clarity with Firebase auth
  email: string | null;
  name: string | null;
  role: Role;
  // Add other user-specific fields if needed
  // e.g., photoURL?: string;
  // e.g., organizationName?: string; (for NGO recipients)
}

export interface FoodPost {
  id: string;
  donorId: string;
  type: string; // e.g., "Cooked Meals", "Fresh Produce", "Bakery Items"
  quantity: string; // e.g., "10 meals", "5 kg", "2 boxes"
  location: string; // For simplicity, text for now. Could be GeoPoint later.
  pickupInstructions?: string;
  expiryWindow: Date | string; // Date object or ISO string
  imageUrl?: string;
  postedAt: Date;
  status: "available" | "requested" | "fulfilled" | "expired";
}

export interface PickupRequest {
  id: string;
  foodPostId: string;
  recipientId: string; // User ID of NGO or individual
  volunteerId?: string | null; // User ID of volunteer who accepted
  requestedAt: Date;
  status: "pending_pickup" | "assigned_to_volunteer" | "fulfilled" | "cancelled";
  fulfilledAt?: Date;
}

export interface ImpactStats {
  totalMealsServed: number;
  kgFoodSaved: number;
  // Potentially more stats: activeVolunteers, donationsThisMonth etc.
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[]; // Optional: roles that can see this nav item
}
