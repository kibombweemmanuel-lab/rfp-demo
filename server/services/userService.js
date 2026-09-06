import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  const [salt, encodedHash] = String(storedHash || '').split(':');
  if (!salt || !encodedHash) return false;
  const expected = Buffer.from(encodedHash, 'hex');
  const actual = scryptSync(password, salt, expected.length || 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function createUserService(store) {
  async function list() {
    return (await store.read()).map(publicUser);
  }

  async function authenticate(email, password) {
    const user = (await store.read()).find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.active !== false);
    return user && verifyPassword(password, user.passwordHash) ? publicUser(user) : null;
  }

  async function get(id) {
    return (await store.read()).find((user) => user.id === id) || null;
  }

  async function create(input) {
    const users = await store.read();
    if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) return null;
    const user = {
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      permissions: input.permissions,
      passwordHash: hashPassword(input.password),
      active: true,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await store.write(users);
    return publicUser(user);
  }

  async function setActive(id, active) {
    const users = await store.read();
    const user = users.find((candidate) => candidate.id === id);
    if (!user) return null;
    user.active = active;
    await store.write(users);
    return publicUser(user);
  }

  return { list, authenticate, get, create, setActive };
}
