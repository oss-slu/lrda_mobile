import { UserData } from "../../types";

export class User {
  private static instance: User;
  private userData: UserData | null = null;

  private constructor() {}

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  public async login(username: string, password: string): Promise<string> {
    try {
      const response = await fetch(
        "http://lived-religion-dev.rerum.io/deer-lr/login",
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      if (response.ok) {
        this.userData = await response.json();
        return "success";
      } else {
        throw new Error("There was a server error logging in.");
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  public async logout() {
    try {
      await fetch("http://lived-religion-dev.rerum.io/deer-lr/logout", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain",
        },
      })
        .then((response) => {
          if (response.ok) {
            this.userData = null;
            console.log('User logged out');
          }
        })
        .catch((err) => {
          return err;
        });
    } catch (error) {console.log('User did not succesfully log out')}
  }

  public getId(): string | null {
    return this.userData?.["@id"] ?? null;
  }

  public getName(): string | null {
    return this.userData?.name ?? null;
  }

  public getRoles(): { administrator: boolean; contributor: boolean } | null {
    return this.userData?.roles ?? null;
  }
}
