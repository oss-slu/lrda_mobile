import { doc, getDoc } from "firebase/firestore";
import { UserData } from "../../types";
import  {db} from "../config/firebase";

/**
 * Provides methods for interacting with the API to fetch, create, update, and delete notes.
 */
const API_BASE_URL = process.env.API_BASE_URL || "https://lived-religion-dev.rerum.io/deer-lr/";

export default class ApiService {
  /**
 * Fetches messages from the API, with optional pagination.
 * @param {boolean} global - Indicates whether to fetch global messages or user-specific messages.
 * @param {boolean} published - Indicates whether to fetch only published messages.
 * @param {string} userId - The ID of the user for user-specific messages.
 * @param {number} [limit=150] - The limit of messages per page. Defaults to 150.
 * @param {number} [skip=0] - The iterator to skip messages for pagination.
 * @param {Array} [allResults=[]] - The accumulated results for pagination.
 * @returns {Promise<any[]>} The array of messages fetched from the API.
 */
static async fetchMessages(
  global: boolean,
  published: boolean,
  userId: string,
  limit = 150,
  skip = 0,
  allResults: any[] = []
): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}query?limit=${limit}&skip=${skip}`;
    const headers = {
      "Content-Type": "application/json",
    };

    let body: { type: string; published?: boolean; creator?: string } = {
      type: "message",
    };

    if (global) {
      body = { type: "message" };
    } else if (published) {
      body = { type: "message", published: true }; // For published messages, no specific creator
    } else {
      body = { type: "message", creator: userId };
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
   
    if (data.length > 0) {
      allResults = allResults.concat(data);
      return this.fetchMessages(global, published, userId, limit, skip + data.length, allResults);
    }

    return allResults;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

static async fetchMessagesBatch(
  global: boolean,
  published: boolean,
  userId: string,
  limit = 20,
  skip = 0
): Promise<any[]> {
try {
  const url = `${API_BASE_URL}query?limit=${limit}&skip=${skip}`;
  const headers = {
    "Content-Type": "application/json",
  };

  let body: { type: string; published?: boolean; creator?: string } = {
    type: "message",
  };

  body = {
    type: "message",
    creator: userId,
    published,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
} catch (error) {
  console.error("Error fetching messages:", error);
  throw error;
}
}

static async fetchMapsMessagesBatch(
  global: boolean,
  published: boolean,
  userId: string,
  limit = 20,
  skip = 0
): Promise<any[]> {
try {
  const url = `${API_BASE_URL}query?limit=${limit}&skip=${skip}`;
  const headers = {
    "Content-Type": "application/json",
  };

  let body: { type: string; published?: boolean; creator?: string } = {
    type: "message",
  };

  body = {
    type: "message",
    published,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data;
} catch (error) {
  console.error("Error fetching messages:", error);
  throw error;
}
}

 /**
   * Fetches user data from Firestore first, then the API if Firestore data is not found.
   * @param {string} uid - The UID of the user.
   * @returns {Promise<UserData | null>} The user data.
   */
 static async fetchUserData(uid: string): Promise<UserData | null> {
  try {
    // Step 1: Firestore fetch
    console.log(`Attempting to fetch user data from Firestore for UID: ${uid}`);
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log("Firestore user data found:", userDoc.data());
      return userDoc.data() as UserData;
    } else {
      console.log("No user data in Firestore for UID:", uid);
    }

    // Step 2: API fetch as fallback
    console.log("Falling back to API fetch for user data.");
    const url = `${API_BASE_URL}query`;
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      "$or": [
        { "@type": "Agent", "uid": uid },
        { "@type": "foaf:Agent", "uid": uid },
      ],
    });

    console.log("API Request Body:", body);

    const response = await fetch(url, { method: "POST", headers, body });
    console.log(`API Response Status (${url}):`, response.status);

    // Ensure the response is not empty
    const text = await response.text();
    console.log("Raw API Response Body:", text);

    if (text.trim() === "") {
      console.error("Empty response body received from API.");
      return null;
    }

    // Attempt to parse the response as JSON
    try {
      const data = JSON.parse(text);
      console.log("Parsed API Response JSON:", data);

      if (Array.isArray(data) && data.length > 0) {
        return data[0] as UserData;
      } else {
        console.log("No valid user data found in API response.");
        return null;
      }
    } catch (parseError) {
      console.error("Error parsing API response as JSON:", parseError);
      console.error("Response body causing error:", text);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}





/**
 * Fetches the name of the creator by querying the API and Firestore with the given creatorId.
 * @param {string} creatorId - The UID of the creator.
 * @returns {Promise<string>} The name of the creator.
 */
static async fetchCreatorName(creatorId: string): Promise<string> {
  try {
    // Step 1: Query the API with creatorId
    const apiUrl = `${API_BASE_URL}query`;
    const headers = { "Content-Type": "application/json" };
    const body = {
      "$or": [
        { "@type": "Agent", "uid": creatorId },
        { "@type": "foaf:Agent", "uid": creatorId }
      ]
    };

    console.log(`Querying API with UID: ${creatorId}`);

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const apiData = await apiResponse.json();

    // Step 2: Check if the API response contains a name
    if (Array.isArray(apiData) && apiData.length > 0 && apiData[0].name) {
      return apiData[0].name;
    } else if (Array.isArray(apiData) && apiData.length > 0) {
      console.warn(`Creator found in API but 'name' attribute is missing for UID: ${creatorId}`);
      return "Unknown Creator";
    }

    // Step 3: If not found in API, query Firestore
   // console.log(`Creator not found in API. Querying Firestore with UID: ${creatorId}`);
    const firestoreDocRef = doc(db, "users", creatorId);
    const firestoreDoc = await getDoc(firestoreDocRef);

    if (firestoreDoc.exists()) {
      const firestoreData = firestoreDoc.data();
      const firestoreName = firestoreData.firstName && firestoreData.lastName
        ? `${firestoreData.firstName} ${firestoreData.lastName}`
        : firestoreData.name || "Unknown Creator";

      console.log(`Creator name found in Firestore: ${firestoreName}`);
      return firestoreName;
    }

    console.warn(`Creator not found in Firestore for UID: ${creatorId}`);
    return "Creator not available";
  } catch (error) {
    console.error(`Error fetching creator name:`, error, creatorId);
    return "Error retrieving creator";
  }
}


  
    /**
     * Creates user data in the API.
     * @param {UserData} userData - The user data to be created.
     * @returns {Promise<Response>} The response from the API.
     */
    static async createUserData(userData: UserData) {
      try {
        const response = await fetch(`${API_BASE_URL}create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "@type": "Agent",
            ...userData,
          }),
        });
        return response;
      } catch (error) {
        console.error("Error creating user data:", error);
        throw error;
      }
    }
  
  /**
   * Deletes a note from the API.
   * @param {string} id - The ID of the note to delete.
   * @param {string} userId - The ID of the user who owns the note.
   * @returns {Promise<boolean>} A boolean indicating whether the deletion was successful.
   */
  static async deleteNoteFromAPI(id: string, userId: string): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}delete`;
      const headers = {
        "Content-Type": "text/plain; charset=utf-8",
      };
      const body = {
        type: "message",
        creator: userId,
        "@id": id,
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 204) {
        return true;
      } else {
        throw response;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  }

  /**
   * Writes a new note to the API.
   * @param {any} note - The note object to be created.
   * @returns {Promise<Response>} The response from the API.
   */
  static async writeNewNote(note: any) {
    return fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "message",
        title: note.title,
        media: note.media,
        BodyText: note.text,
        creator: note.creator,
        latitude: note.latitude || "",
        longitude: note.longitude || "",
        audio: note.audio,
        published: note.published,
        tags: note.tags,
        time: note.time || new Date (),
      }),
    });
  }

  /**
   * Overwrites an existing note in the API.
   * @param {any} note - The note object to be updated.
   * @returns {Promise<Response>} The response from the API.
   */
  static async overwriteNote(note: any) {
    return await fetch(`${API_BASE_URL}overwrite`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "@id": note.id,
        title: note.title,
        BodyText: note.text,
        type: "message",
        creator: note.creator,
        media: note.media,
        latitude: note.latitude,
        longitude: note.longitude,
        audio: note.audio,
        published: note.published,
        tags: note.tags,
        time: note.time,
        isArchived:note.isArchived,
      }),
    });
  }

  static async searchMessages(query: string): Promise<any[]> {
    try {
      const url = `${API_BASE_URL}query`;
      const headers = {
        "Content-Type": "application/json",
      };
  
      // Request body for retrieving messages of type "message"
      const body = {
        type: "message",
      };
  
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
  
      let data = await response.json();
  
      // Convert the query to lowercase for case-insensitive matching
      const lowerCaseQuery = query.toLowerCase();
  
      // Filter the messages by title or tags containing the query string
      data = data.filter((message: any) => {
        // Check if title contains the query string
        if (message.title && typeof message.title === "string" && message.title.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
  
        // Check if tags contain the query string
        if (
          Array.isArray(message.tags) &&
          message.tags.some(
            (tag: any) =>
              typeof tag === "string" && tag.toLowerCase().includes(lowerCaseQuery)
          )
        ) {
          return true;
        }
  
        return false;
      });
  
      return data;
    } catch (error) {
      console.error("Error searching messages:", error);
      throw error;
    }
  }
  
  
  
}