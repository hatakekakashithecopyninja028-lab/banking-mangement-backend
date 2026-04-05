import { Router, type IRouter } from "express";
import { User } from "../../models/User.js";
import { authenticate, generateToken, type AuthRequest } from "../../middlewares/auth.js";
import { SignupBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password, role } = parsed.data;

  const existing = await User.findOne({ email, isDeleted: false });
  if (existing) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  const user = new User({ name, email, password, role: role ?? "viewer" });
  await user.save();

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.status === "inactive") {
    res.status(403).json({ error: "Account is inactive" });
    return;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

router.get("/auth/me", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const user = await User.findOne({ _id: req.user!.id, isDeleted: false });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

export default router;
