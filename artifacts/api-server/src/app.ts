import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import session from "express-session";
import { existsSync } from "fs";
import { join } from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  ADMIN_AUTH_COOKIE,
  getAdminUsernameFromToken,
  getSessionSecret,
} from "./lib/adminAuth";

const app: Express = express();

// Behind the deployment proxy — required so secure session cookies work in production
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Vercel Serverless instances do not share express-session's in-memory store.
// Rehydrate the admin identity from a signed cookie so every instance can
// authorize the same browser consistently.
app.use((req, _res, next) => {
  const username = getAdminUsernameFromToken(req.cookies?.[ADMIN_AUTH_COOKIE]);
  if (username) {
    (req.session as any).adminAuthenticated = true;
    (req.session as any).adminUsername = username;
  }
  next();
});

app.use("/api", router);

// Keep operational failures JSON-shaped for the web client.  In particular,
// a database connection issue must not become Express's generic HTML 500 page,
// which hides the actionable configuration problem from an admin.
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error({ err, requestId: req.id }, "Unhandled API request error");
  res.status(500).json({
    error: "The database is temporarily unavailable. Please verify the DATABASE_URL setting and try again.",
  });
});

// On Hostinger (and any regular Node.js host), the API also serves the compiled
// React site. This keeps the browser and API on one domain so admin cookies and
// relative /api requests work without special proxy configuration.
const staticDir =
  process.env.STATIC_DIR ||
  [
    // Hostinger commonly starts the root package from the repository root.
    join(process.cwd(), "artifacts", "top-quality-prospect", "dist", "public"),
    // Keep the package-local layout working for local and alternate hosts.
    join(process.cwd(), "..", "top-quality-prospect", "dist", "public"),
  ].find((candidate) => existsSync(join(candidate, "index.html"))) ||
  join(process.cwd(), "artifacts", "top-quality-prospect", "dist", "public");
const indexFile = join(staticDir, "index.html");

if (existsSync(indexFile)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/")) {
      res.sendFile(indexFile);
      return;
    }
    next();
  });
}

export default app;
