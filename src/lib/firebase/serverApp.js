// Enforces that this module is only executed on the server side
// Prevents accidental use in client-side bundles
// Reference: Next.js composition patterns for server-only code
import "server-only";

// Import cookie utilities from Next.js to access HTTP-only cookies on the server
import { cookies } from "next/headers";

// Import Firebase initialization functions
import { initializeServerApp, initializeApp } from "firebase/app";

// Import Firebase authentication function to access auth state
import { getAuth } from "firebase/auth";

// Asynchronously returns an authenticated Firebase app instance for SSR or SSG
export async function getAuthenticatedAppForUser() {
  // Retrieve the user's ID token from the "__session" cookie
  const authIdToken = (await cookies()).get("__session")?.value;

  // Initialize a Firebase app instance configured for server-side usage
  // This uses the new Firebase Server App API to support SSR with credentials
  const firebaseServerApp = initializeServerApp(
    initializeApp(), // Initialize the base Firebase app
    {
      authIdToken,    // Pass the user's ID token for authentication
    }
  );

  // Get the Firebase Auth instance tied to the server app
  const auth = getAuth(firebaseServerApp);

  // Wait until the authentication state is fully resolved
  await auth.authStateReady();

  // Return both the server app instance and the authenticated user object
  return { firebaseServerApp, currentUser: auth.currentUser };
}
