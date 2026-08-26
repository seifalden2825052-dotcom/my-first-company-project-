// Explicit Vercel route for admin QR image requests.
// The shared Express bundle still owns authentication and QR generation.
export { default } from "../../../artifacts/api-server/dist-serverless/index.js";