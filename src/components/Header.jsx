// Mark this file as a client component in Next.js
"use client";

// Import React and the useEffect hook for managing side effects
import React, { useEffect } from "react";

// Import Next.js Link component for client-side navigation
import Link from "next/link";

// Import Firebase authentication helpers
import {
  signInWithGoogle,     // Function to sign in using Google OAuth
  signOut,              // Function to sign out the current user
  onIdTokenChanged,     // Listener for changes in the user's ID token
} from "@/src/lib/firebase/auth.js";

// Import function to seed the database with sample restaurants and reviews
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";

// Import cookie management functions for session handling
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook to manage user session and sync it with cookies
function useUserSession(initialUser) {
  useEffect(() => {
    // Set up a listener for changes in the user's ID token
    return onIdTokenChanged(async (user) => {
      if (user) {
        // If user is signed in, get their ID token and store it in a cookie
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        // If user is signed out, remove the session cookie
        await deleteCookie("__session");
      }

      // If the user hasn't changed, do nothing
      if (initialUser?.uid === user?.uid) {
        return;
      }

      // If the user has changed, reload the page to reflect new state
      window.location.reload();
    });
  }, [initialUser]); // Re-run effect if initialUser changes

  // Return the initial user object for use in the component
  return initialUser;
}

// Main Header component that displays navigation and user profile
export default function Header({ initialUser }) {
  // Use the custom hook to get the current user session
  const user = useUserSession(initialUser);

  // Handle user sign-out when "Sign Out" is clicked
  const handleSignOut = (event) => {
    event.preventDefault(); // Prevent default link behavior
    signOut();              // Call Firebase sign-out function
  };

  // Handle user sign-in when "Sign In" is clicked
  const handleSignIn = (event) => {
    event.preventDefault(); // Prevent default link behavior
    signInWithGoogle();     // Call Firebase sign-in function
  };

  // Render the header UI
  return (
    <header>
      {/* Logo and homepage link */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>

      {/* If user is signed in, show profile and menu */}
      {user ? (
        <>
          <div className="profile">
            <p>
              {/* Display user's profile image and name */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"} // Fallback image if no photoURL
                alt={user.email}                     // Use email as alt text
              />
              {user.displayName}
            </p>

            {/* Dropdown menu with user options */}
            <div className="menu">
              ...
              <ul>
                {/* Display user's name again in the menu */}
                <li>{user.displayName}</li>

                {/* Link to add sample restaurants to Firestore */}
                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                {/* Link to sign out */}
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // If user is not signed in, show sign-in button
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
