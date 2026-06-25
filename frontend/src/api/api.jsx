import axios from "axios";

const api = axios.create({
  baseURL: "https://project1-1-hvsi.onrender.com/"
});

export default api;