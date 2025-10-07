// Import Firebase authentication functions from the Firebase SDK
import {
  GoogleAuthProvider,          // Enables Google sign-in functionality
  signInWithPopup,             // Opens a popup window for Google sign-in
  onAuthStateChanged as _onAuthStateChanged, // Listener for changes in user's authentication state
  onIdTokenChanged as _onIdTokenChanged,     // Listener for changes in user's ID token
} from "firebase/auth";

// Import the Firebase authentication instance from your client-side Firebase setup
import { auth } from "@/src/lib/firebase/clientApp";

// Wrapper function to listen for changes in authentication state (e.g., login/logout)
export function onAuthStateChanged(cb) {
  // Pass the Firebase auth instance and callback to the SDK's listener
  return _onAuthStateChanged(auth, cb);
}

// Wrapper function to listen for changes in the user's ID token
export function onIdTokenChanged(cb) {
  // Pass the Firebase auth instance and callback to the SDK's listener
  return _onIdTokenChanged(auth, cb);
}

// Function to sign in the user using Google OAuth via a popup
export async function signInWithGoogle() {
  // Create a new GoogleAuthProvider instance
  const provider = new GoogleAuthProvider();

  try {
    // Attempt to sign in the user with a popup using the Google provider
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during sign-in
    console.error("Error signing in with Google", error);
  }
}

// Function to sign out the currently authenticated user
export async function signOut() {
  try {
    // Call Firebase's signOut method on the auth instance
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign-out
    console.error("Error signing out with Google", error);
  }
}
