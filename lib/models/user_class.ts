import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types";
import { getItem } from "../utils/async_storage";
import { signInWithEmailAndPassword, onAuthStateChanged,signOut } from "firebase/auth";
import { auth } from "../config/firebase";
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
        // User is signed in.
        const userData = await ApiService.fetchUserData(user.uid);
        if (userData) {
          this.userData = userData;
          this.persistUser(userData);
        }
        this.notifyLoginState();
      } else {
        // User is signed out.
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
  
      // Store the token in AsyncStorage (similar to localStorage)
      await AsyncStorage.setItem('authToken', token);
      console.log("Auth token saved in AsyncStorage");
  
      // Optionally, you can use SecureStore for sensitive data:
      // await SecureStore.setItemAsync('authToken', token);
      // console.log("Auth token saved in SecureStore");
  
      // Fetch user data based on the user ID
      const userData = await ApiService.fetchUserData(user.uid);
      
      if (userData) {
        // Store the user data in the class
        this.userData = userData;
        console.log("Fetched user data: ", userData);
  
        // Persist user data locally, if needed
        await this.persistUser(userData);
        console.log("User data persisted locally");
      } else {
        console.log("No user data found");
      }
  
      // Notify app about login state change
      this.notifyLoginState();
      console.log("Login state updated");
  
      // Successfully logged in
      return "success";
    } catch (error) {
      console.error("Login error: ", error);
      // Reject the promise with the error message
      return Promise.reject(error);
    }
  }

  public async logout(auth: any, dispatch: any) {
    try {
      // Call Firebase's signOut method
      await signOut(auth);
  
      // Clear user data from your app's state
      this.userData = null;
      this.clearUser();
      this.notifyLoginState();
  
      // Remove the auth token from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      // If using SecureStore:
      // await SecureStore.deleteItemAsync('authToken');
  
      // Dispatch navigation state to move to the login screen or logged-out state
      dispatch(setNavState("login"));
  
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error during Firebase logout", error);
      // You can add additional error handling here, like showing an error message to the user
    }
  }

  public async getId(): Promise<string | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }
    return this.userData?.["uid"] ?? null;
  }

  public async getName(): Promise<string | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }
    return this.userData?.name ?? null;
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
