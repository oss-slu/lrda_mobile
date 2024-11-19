import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types";
import { getItem } from "../utils/async_storage";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { auth, db } from "../config/firebase"; // Import Firestore database
import { doc, getDoc } from "firebase/firestore"; // Firestore imports
import ApiService from "../utils/api_calls";
import { setNavState } from "../../redux/slice/navigationSlice";


export class User {
  private static instance: User;
  private userData: UserData | null = null;
  private callback: ((isLoggedIn: boolean) => void) | null = null;

  private constructor() {
    this.initializeUser();
  }

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  private async persistUser(userData: UserData) {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.log(error);
    }
  }

  public setLoginCallback(callback: (isLoggedIn: boolean) => void) {
    this.callback = callback;
  }

  private notifyLoginState() {
    if (this.callback) {
      this.callback(this.userData !== null);
    }
  }

  private async loadUser(): Promise<UserData | null> {
    try {
      const value = await AsyncStorage.getItem("userData");
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  private async clearUser() {
    try {
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.log(error);
    }
  }

  private async initializeUser() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // First, try to fetch user data from the API
        const userData = await ApiService.fetchUserData(user.uid);
        
        if (userData) {
          // If found in the API, set user data and persist it
          this.userData = userData;
          this.persistUser(userData);
        } else {
          // If not found in the API, try Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            this.userData = userDoc.data() as UserData;
            this.persistUser(this.userData);
          } else {
            console.log("User not found in API or Firestore.");
          }
        }
        this.notifyLoginState();
      } else {
        // User is signed out
        this.userData = null;
        this.clearUser();
        this.notifyLoginState();
      }
    });
  }

  public async login(email: string, password: string): Promise<string> {
    try {
      console.log("Attempting to sign in...");
  
      // Firebase sign-in method
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log(`Firebase sign-in successful. User UID: ${user.uid}`);
  
      // Retrieve Firebase ID token
      const token = await user.getIdToken();
      console.log(`Login token received: ${token}`);
  
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      console.log("Auth token saved in AsyncStorage");
  
      // Attempt to fetch user data from the API, falling back on Firestore if necessary
      const userData = await ApiService.fetchUserData(user.uid);
      
      if (userData) {
        // If user data is found in the API
        this.userData = userData;
        console.log("User data found in API:", userData);
      } else {
        // If not found in the API, try fetching from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          this.userData = userDoc.data() as UserData;
          console.log("User data found in Firestore:", this.userData);
        } else {
          console.log("User data not found in Firestore or API.");
        }
      }
  
      // Persist user data and update login state
      if (this.userData) {
        await this.persistUser(this.userData);
        console.log("User data persisted locally");
        this.notifyLoginState();
      }

      return "success";
    } catch (error) {
      console.error("Login error: ", error);
      return Promise.reject(error);
    }
  }

  public async logout(dispatch: any) {
    try {
      const auth = getAuth();
      await signOut(auth);
  
      this.userData = null;
      this.clearUser();
      this.notifyLoginState();
  
      await AsyncStorage.removeItem('authToken');
  
      dispatch(setNavState("login"));
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error during Firebase logout", error);
    }
  }

  public async getId(): Promise<string | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }
    // Return `uid` if available, else fallback to `@id`
    return this.userData ? (this.userData["uid"] ?? this.userData["@id"]) : null;
  }


  public async getName(): Promise<string | null> {
    if (!this.userData) {
      // Load user data from AsyncStorage if not already loaded
      this.userData = await this.loadUser();
    }
  
    // Handle both naming structures
    if (this.userData) {
      // Check if the name is a single string or separate fields
      if ('name' in this.userData) {
        return this.userData.name; // API format
      } else if ('firstName' in this.userData && 'lastName' in this.userData) {
        return `${this.userData.firstName} ${this.userData.lastName}`; // Firestore format
      }
    }
  
    return null; // No valid name found
  }
  

  public async hasOnboarded(): Promise<boolean> {
    const onboarded = await getItem('onboarded');
    return onboarded === '1';
  }

  public async getRoles(): Promise<{
    administrator: boolean;
    contributor: boolean;
  } | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }
    return this.userData?.roles ?? null;
  }
}
