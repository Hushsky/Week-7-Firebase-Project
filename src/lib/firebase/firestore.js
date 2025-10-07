// Import function to generate fake restaurant and review data
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firestore functions from Firebase SDK
import {
  collection,        // Creates a reference to a Firestore collection
  onSnapshot,        // Sets up a real-time listener for query results
  query,             // Builds a Firestore query
  getDocs,           // Fetches documents from a query
  doc,               // Creates a reference to a specific document
  getDoc,            // Fetches a single document
  updateDoc,         // Updates fields in a document
  orderBy,           // Sorts query results by a field
  Timestamp,         // Represents a Firestore timestamp
  runTransaction,    // Executes multiple reads/writes atomically
  where,             // Adds a filter condition to a query
  addDoc,            // Adds a new document to a collection
  getFirestore,      // Gets the Firestore instance
} from "firebase/firestore";

// Import the Firestore database instance from your client-side Firebase setup
import { db } from "@/src/lib/firebase/clientApp";

// Updates the photo URL for a specific restaurant document
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Create a reference to the restaurant document
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);

  // If the reference is valid, update the 'photo' field
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Placeholder function for updating restaurant rating using a transaction
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  return; // No logic implemented yet
};

// Placeholder function for adding a review to a restaurant
export async function addReviewToRestaurant(db, restaurantId, review) {
  return; // No logic implemented yet
}

// Applies filters to a Firestore query based on search parameters
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
    q = query(q, where("category", "==", category)); // Filter by category
  }
  if (city) {
    q = query(q, where("city", "==", city)); // Filter by city
  }
  if (price) {
    q = query(q, where("price", "==", price.length)); // Filter by price level
  }
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc")); // Sort by average rating
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc")); // Sort by number of reviews
  }
  return q; // Return the modified query
}

// Fetches restaurant documents from Firestore with optional filters
export async function getRestaurants(db = db, filters = {}) {
  let q = query(collection(db, "restaurants")); // Start with base query

  q = applyQueryFilters(q, filters); // Apply filters to the query
  const results = await getDocs(q); // Execute the query

  // Map each document to a plain object with timestamp converted to Date
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp
    };
  });
}

// Placeholder for real-time restaurant snapshot function
export function getRestaurantsSnapshot(cb, filters = {}) {
  return; // No logic implemented yet
}

// Fetches a single restaurant document by ID
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId); // Log error
    return;
  }

  const docRef = doc(db, "restaurants", restaurantId); // Create document reference
  const docSnap = await getDoc(docRef); // Fetch document snapshot

  // Return document data with timestamp converted to Date
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Real-time listener for restaurant collection with filters
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function"); // Validate callback
    return;
  }

  let q = query(collection(db, "restaurants")); // Start base query
  q = applyQueryFilters(q, filters); // Apply filters

  // Set up real-time listener on the query
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert timestamp
      };
    });

    cb(results); // Pass results to callback
  });
}

// Fetches all reviews for a specific restaurant, sorted by timestamp
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId); // Validate ID
    return;
  }

  // Build query for reviews subcollection
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc") // Sort by newest first
  );

  const results = await getDocs(q); // Execute query

  // Map each review document to a plain object
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(), // Convert timestamp
    };
  });
}

// Real-time listener for reviews of a specific restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId); // Validate ID
    return;
  }

  // Build query for reviews subcollection
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc") // Sort by newest first
  );

  // Set up real-time listener on the query
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert timestamp
      };
    });
    cb(results); // Pass results to callback
  });
}

// Adds sample restaurants and reviews to Firestore for demo/testing
export async function addFakeRestaurantsAndReviews() {
  const data = await generateFakeRestaurantsAndReviews(); // Generate mock data

  // Loop through each restaurant and its reviews
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add restaurant document to Firestore
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add each review to the restaurant's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document"); // Log general error
      console.error("Error adding document: ", e); // Log specific error
    }
  }
}
