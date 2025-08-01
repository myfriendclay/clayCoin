// Type assertion to avoid TypeScript error for import.meta.env
const env = import.meta.env;

export const API_URL = env.VITE_API_URL as string;

export const ENV = {
  API_URL,
};

export default ENV; 