export const ROLE_PERMISSIONS = {
  owner: ['dashboard', 'insights', 'animals', 'health', 'feeding', 'breeding', 'production', 'expenses', 'sales', 'reports', 'users'],
  manager: ['dashboard', 'insights', 'animals', 'health', 'feeding', 'breeding', 'production', 'expenses', 'sales', 'reports', 'users'],
  veterinarian: ['dashboard', 'insights', 'animals', 'health', 'feeding', 'reports'],
  worker: ['dashboard', 'insights', 'animals', 'production', 'feeding']
}

export const ROLE_ACTIONS = {
  owner: ['animals.write', 'health.write', 'feeding.write', 'breeding.write', 'production.create', 'production.manage', 'expenses.write', 'sales.write', 'users.manage', 'reports.generate', 'etims.manage'],
  manager: ['animals.write', 'health.write', 'feeding.write', 'breeding.write', 'production.create', 'production.manage', 'expenses.write', 'sales.write', 'reports.generate', 'etims.manage'],
  veterinarian: ['health.write', 'feeding.write'],
  worker: ['production.create']
}

export function hasRouteAccess(role, routeKey) {
  const allowed = ROLE_PERMISSIONS[role] || []
  return allowed.includes(routeKey)
}

export function hasActionAccess(role, actionKey) {
  const allowed = ROLE_ACTIONS[role] || []
  return allowed.includes(actionKey)
}

export function canManageUsers(role) {
  return hasActionAccess(role, 'users.manage')
}
