import { Router, type IRouter } from "express";
import { User } from "../../models/User.js";
import { authenticate, requireRole, type AuthRequest } from "../../middlewares/auth.js";
import { CreateUserBody, UpdateUserBody, GetUserParams, UpdateUserParams, DeleteUserParams, ListUsersQueryParams } from "@workspace/api-zod";

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

router.get("/users", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const queryParams = ListUsersQueryParams.safeParse(req.query);
  const page = queryParams.success ? (queryParams.data.page ?? 1) : 1;
  const limit = queryParams.success ? (queryParams.data.limit ?? 20) : 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments({ isDeleted: false }),
  ]);

  res.json({ users: users.map(formatUser), total, page, limit });
});

router.post("/users", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password, role, status } = parsed.data;

  const existing = await User.findOne({ email, isDeleted: false });
  if (existing) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  const user = new User({ name, email, password, role, status: status ?? "active" });
  await user.save();
  res.status(201).json(formatUser(user));
});

router.get("/users/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const user = await User.findOne({ _id: params.data.id, isDeleted: false });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.patch("/users/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = await User.findOneAndUpdate(
    { _id: params.data.id, isDeleted: false },
    { $set: parsed.data },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.delete("/users/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const user = await User.findOneAndUpdate(
    { _id: params.data.id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
