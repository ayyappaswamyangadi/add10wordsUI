import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE;
export const apiClient = () =>
  axios.create({
    baseURL: baseURL,
    timeout: 10000,
    withCredentials: true,
  });
