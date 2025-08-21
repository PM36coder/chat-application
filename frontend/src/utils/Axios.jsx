import axios from "axios";

const API = axios.create({
  baseURL:  "https://chat-application-x4mq.onrender.com/api",
  withCredentials: true,
});

export default API;