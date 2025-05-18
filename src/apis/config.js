export const token = import.meta.env.VITE_FREELANCER_TOKEN;

if (!token) {
  console.error(
    "API token not found! Make sure to set VITE_FREELANCER_TOKEN in your .env file"
  );
}
