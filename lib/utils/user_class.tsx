export class User {
    private static instance: User;
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
          const data = await response.json();
          console.log(data);
        } else {
          throw new Error("There was a server error logging in.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  
  // Example usage:
  const user = User.getInstance();
  user.login("Stuart Ray", "4");
  