import bcrypt from "bcryptjs";

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const users = new Map<string, User>();

export function toSafeUser(u: User): SafeUser {
  const { passwordHash: _p, ...safe } = u;
  return safe;
}

// Seed admin user
const adminId = "admin-1";
const adminHash = bcrypt.hashSync("Admin123!", 10);
users.set(adminId, {
  id: adminId,
  name: "Ovenly Admin",
  email: "admin@kanzbakery.com",
  passwordHash: adminHash,
  role: "admin",
  createdAt: new Date().toISOString(),
});
