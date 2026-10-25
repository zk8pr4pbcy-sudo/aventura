const ROLE_PERMISSIONS = {
  owner: new Set([
    "requests:read",
    "requests:update",
    "notes:write",
    "content:manage",
    "users:manage",
    "audit:read"
  ]),
  admin: new Set([
    "requests:read",
    "requests:update",
    "notes:write",
    "content:manage",
    "users:manage",
    "audit:read"
  ]),
  operations: new Set([
    "requests:read",
    "requests:update",
    "notes:write"
  ]),
  content: new Set([
    "requests:read",
    "content:manage"
  ]),
  viewer: new Set([
    "requests:read"
  ])
};

export function hasPermission(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.has(permission));
}

export function requirePermission(user, permission) {
  if (!user?.isActive || !hasPermission(user.role, permission)) {
    const error = new Error("forbidden");
    error.statusCode = 403;
    throw error;
  }
  return user;
}
