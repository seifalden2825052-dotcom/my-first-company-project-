// Explicit Vercel route for certificate verification codes.
// The shared Express bundle still owns the actual route and validation.
export { default } from "../../../artifacts/api-server/dist-serverless/index.js";