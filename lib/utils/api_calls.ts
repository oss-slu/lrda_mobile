class ApiService {
    static async fetchMessages(global: boolean, userId: string): Promise<any[]> {
      let response;
      try {
        const url = "http://lived-religion-dev.rerum.io/deer-lr/query";
        const headers = {
          "Content-Type": "application/json",
        };
  
        const body = global
          ? { type: "message" }
          : { type: "message", creator: userId };
  
        response = await fetch(url, {
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
  
    static async deleteNoteFromAPI(id: string, userId: string): Promise<boolean> {
      try {
        const url = "http://lived-religion-dev.rerum.io/deer-lr/delete";
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
  
        console.log(response);
  
        if (response.status === 204) {
          return true;
        } else {
          console.log(response);
          throw response;
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        return false;
      }
    }
  }
  
  export default ApiService;
  