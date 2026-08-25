import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import {
  ADMIN_AUTH_COOKIE,
  createAdminToken,
} from "../lib/adminAuth";

const router: IRouter = Router();

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME ?? "admin").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? "TQP@2010").trim();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  (req.session as any).adminAuthenticated = true;
  (req.session as any).adminUsername = username;
  res.cookie(ADMIN_AUTH_COOKIE, createAdminToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ authenticated: true, username });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.clearCookie(ADMIN_AUTH_COOKIE, { path: "/" });
    res.json({ authenticated: false, username: null });
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const session = req.session as any;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ authenticated: true, username: session.adminUsername ?? null });
});

export default router;
