import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { dbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meridian_wealth_pilot_super_secret_jwt_key_2026');

    let user = null;
    if (dbStatus.connected) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.find((u) => u._id === decoded.id || u.email === decoded.email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
      error: err.message,
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: [${roles.join(', ')}]`,
      });
    }
    next();
  };
}
