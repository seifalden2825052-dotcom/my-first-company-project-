// Vercel serverless entry. Uses the committed prebuilt bundle so no build
// tooling is required at deploy time.
export { default } from "../artifacts/api-server/dist-serverless/index.js";
