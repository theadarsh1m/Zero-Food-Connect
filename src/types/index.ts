
import type { Timestamp } from "firebase/firestore"; // Import Timestamp

export type Role = "donor" | "recipient" | "volunteer" | "admin";

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: Role;
  photoURL?: string | null;
  phoneNumber?: string | null;
}

export type FoodPostStatus = 
  | "available" 
  | "requested" // Original generic requested, can be deprecated or used as a general "someone is interested"
  | "claimed_by_recipient" // Recipient will self-pickup
  | "delivery_requested" // Recipient requested volunteer delivery
  | "volunteer_assigned" // A volunteer has accepted the delivery request
  | "fulfilled" 
  | "expired";

export type FoodClaimType = "self-pickup" | "volunteer-delivery";

export interface FoodPost {
  id?: string; 
  donorId: string;
  donorName?: string; 
  foodType: string;
  quantity: string;
  location: string; 
  latitude?: number; 
  longitude?: number; 
  pickupInstructions?: string;
  expiryDate: Timestamp; 
  imageUrl?: string; 
  imagePath?: string; 
  postedAt: Timestamp; 
  status: FoodPostStatus;
  requestedByUid?: string; // UID of the recipient who initiated a request (either self-pickup or delivery)
  requestedAt?: Timestamp; 
  claimedByUid?: string; // Specifically for self-pickup by recipient
  claimType?: FoodClaimType; // To distinguish between self-pickup and volunteer delivery
  // volunteerDeliveryRequestId?: string; // Optionally link to the FoodDeliveryRequest doc ID
}

export type DeliveryRequestStatus = 
  | "pending_volunteer_assignment"
  | "assigned_to_volunteer"
  | "pickup_in_progress"
  | "delivery_in_progress"
  | "delivered"
  | "cancelled_by_recipient"
  | "cancelled_by_volunteer"
  | "cancelled_by_donor";

export interface FoodDeliveryRequest {
  id?: string; // Firestore document ID
  donationId: string; // ID of the original FoodPost
  donorId: string;
  donorName?: string;
  foodType: string;
  quantity: string;
  pickupLocation: string; // Textual address from FoodPost
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupInstructions?: string;
  
  recipientId: string;
  recipientName?: string; // Optional, can be fetched if needed
  // recipientDeliveryAddress?: string; // If different from a stored default recipient address

  status: DeliveryRequestStatus;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string; // Optional

  requestedAt: Timestamp; // When the recipient requested delivery
  assignedAt?: Timestamp; // When a volunteer accepted
  pickedUpAt?: Timestamp; // When volunteer picked up from donor
  deliveredAt?: Timestamp; // When volunteer delivered to recipient
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
