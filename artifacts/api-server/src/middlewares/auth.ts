import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "changeme_jwt_secret_key";

export function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const user = await User.findOne({ _id: decoded.id, isDeleted: false });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  if (user.status === "inactive") {
    res.status(403).json({ error: "Account is inactive" });
    return;
  }

  req.user = { id: user.id, email: user.email, role: user.role, status: user.status };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
