// Import the RestaurantListings React component to render the list of restaurants
import RestaurantListings from "@/src/components/RestaurantListings.jsx";

// Import the function to fetch restaurant data from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";

// Import the function that returns a Firebase app instance authenticated for the current user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";

// Import Firestore SDK function to access the Firestore database
import { getFirestore } from "firebase/firestore";

// Instruct Next.js to treat this route as dynamic (server-side rendered)
// Without this, Next.js may pre-render it as static during build time
export const dynamic = "force-dynamic";

// Optional: forces server-side rendering by disabling revalidation caching
// Uncommenting this line would ensure the page is re-rendered on every request
// export const revalidate = 0;

// Define the default exported async function for the Home page
export default async function Home(props) {
  // Extract search parameters from props (e.g., ?city=London&category=Indian)
  const searchParams = await props.searchParams;

  // Get an authenticated Firebase app instance for the current user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();

  // Fetch filtered restaurant data from Firestore using the authenticated app and search parameters
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp), // Get Firestore instance from the authenticated app
    searchParams                     // Pass search filters to query restaurants
  );

  // Render the main content of the page, passing restaurant data and filters to the component
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants} // Initial list of restaurants to display
        searchParams={searchParams}     // Filters used to fetch the data
      />
    </main>
  );
}
