import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../../types";
import { getItem } from "../utils/async_storage";
import {
  signInWithEmail,
  signOut as authSignOut,
  getCurrentSession,
} from "../auth/client";

const USER_DATA_KEY = "userData";

export class User {
  private static instance: User;
  private userData: UserData | null = null;
  private callback: ((isLoggedIn: boolean) => void) | null = null;

  private constructor() { }

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  private async persistUser(userData: UserData) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
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
      const value = await AsyncStorage.getItem(USER_DATA_KEY);
      if (value && value.trim() !== "") {
        try {
          return JSON.parse(value);
        } catch (parseError) {
          console.error("JSON parse error. Invalid data format:", value, parseError);
        }
      }
    } catch (error) {
      console.error("Error retrieving or parsing user data from AsyncStorage:", error);
    }
    return null;
  }

  private async clearUser() {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.log(error);
    }
  }

  private async clearSession() {
    this.userData = null;
    await this.clearUser();
  }

  public async initializeUser(): Promise<boolean> {
    try {
      const { data: session, error } = await getCurrentSession();

      if (error || !session?.user) {
        await this.clearSession();
        this.notifyLoginState();
        return false;
      }

      this.userData = session.user as UserData;
      await this.persistUser(this.userData);
      this.notifyLoginState();
      return true;
    } catch (error) {
      console.error("Error initializing user session:", error);
      await this.clearSession();
      this.notifyLoginState();
      return false;
    }
  }

  public async login(email: string, password: string): Promise<string> {
    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        throw new Error(error.message || "Failed to sign in");
      }

      if (!data?.user) {
        throw new Error("Missing user in sign-in response");
      }

      this.userData = data.user as UserData;
      await this.persistUser(this.userData);
      this.notifyLoginState();

      return "success";
    } catch (error) {
      console.error("Login error: ", error);
      return Promise.reject(error);
    }
  }

  public async logout(dispatch?: any) {
    try {
      await authSignOut();
    } catch (error) {
      console.error("Error during API sign out", error);
    } finally {
      await this.clearSession();
      this.notifyLoginState();
    }
  }

  public async getId(): Promise<string | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }
    return this.userData
      ? (this.userData["uid"] ?? this.userData["@id"] ?? this.userData["id"])
      : null;
  }

  public async getName(): Promise<string | null> {
    if (!this.userData) {
      this.userData = await this.loadUser();
    }

    if (!this.userData) {
      return null;
    }

    const profile = this.userData as UserData & {
      firstName?: string;
      lastName?: string;
      name?: string;
    };

    if (typeof profile.name === "string" && profile.name.trim().length > 0) {
      return profile.name;
    }

    const first = typeof profile.firstName === "string" ? profile.firstName : "";
    const last = typeof profile.lastName === "string" ? profile.lastName : "";
    const fullName = `${first} ${last}`.trim();

    return fullName.length > 0 ? fullName : null;
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

  public static async getHasDoneTutorial(page_tutorial): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(page_tutorial);
      if (value !== null) {
        return JSON.parse(value);
      }
      else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  public static async setUserTutorialDone(page_tutorial, bool) {
    try {
      await AsyncStorage.setItem(page_tutorial, JSON.stringify(bool));
    } catch (error) {
      console.log(error);
    }
  }
}
