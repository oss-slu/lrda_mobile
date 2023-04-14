type UserData = {
  "@id": string;
  name: string;
  roles: {
    administrator: boolean;
    contributor: boolean;
  };
};

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

  public async login(username: string, password: string): Promise<void> {
    try {
      const response = await fetch('http://lived-religion-dev.rerum.io/deer-lr/login', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        this.userData = await response.json();
      } else {
        throw new Error("There was a server error logging in.");
      }
    } catch (error) {
      console.error(error);
    }
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
