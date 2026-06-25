import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'apex-cricket-super-secret-key-12345';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getAuthUser(req) {
  try {
    // Check for cookie first
    let token = null;
    if (req.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get('token')?.value;
    } else if (req.headers && typeof req.headers.get === 'function') {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function verifyAdmin(req) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
