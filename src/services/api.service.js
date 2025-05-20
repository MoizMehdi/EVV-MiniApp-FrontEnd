import axios from "axios";
import { toast } from "react-toastify";

/**
 * This file doesn't do much. It's just a wrapper for axios that only exists to:
 * 1 - Set the base URL on axios from environment vars
 * 2 - Stuff the `Authorization` header in before a request goes out
 * 3 - Maybe other stuff later
 */

// axios.defaults.baseURL = "http://34.202.229.25:4010/api/v1/";

// Export our custom axios instance with auth headers added
export const api = axios.create({
   baseURL: "/api/v1/",
  timeout: 60 * 1000,
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    console.error("Error", err);
    switch (err?.response?.status) {
      case 401:
        break;
      default:
        toast.error(err?.response?.data?.message || "Something went wrong!");
    }

    return {
      data: {
        status: false,
        message: err?.response?.data?.message || "Server unavailable, start backend server please",
        data: null,
      },
    };
  }
);
