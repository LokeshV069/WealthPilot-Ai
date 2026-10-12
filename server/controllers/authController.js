import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { dbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'meridian_wealth_pilot_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId || null,
    },
    secret,
    { expiresIn }
  );
}

// @desc    Register a new Manager or Client
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res) {
  try {
    const { name, email, password, role = 'client', age, riskTolerance, goals } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    if (dbStatus.connected) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      let clientId = null;
      if (role === 'client') {
        const clientCount = await ClientProfile.countDocuments();
        clientId = `C${String(clientCount + 1).padStart(3, '0')}`;
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role,
        clientId,
      });

      // If registered as client, create default initial client profile
      if (role === 'client') {
        await ClientProfile.create({
          clientId,
          name,
          email: normalizedEmail,
          age: age || 30,
          riskTolerance: riskTolerance || 'moderate',
          goals: goals || ['retirement'],
          targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
          holdings: [],
          lifeEvents: [],
          totalValue: 0,
        });
      }

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: `Account created successfully as ${role}.`,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        },
      });
    } else {
      // In-Memory Fallback
      const existing = memoryStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      let clientId = null;
      if (role === 'client') {
        clientId = `C${String(memoryStore.clientProfiles.length + 1).padStart(3, '0')}`;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        clientId,
        createdAt: new Date(),
      };

      memoryStore.users.push(newUser);

      if (role === 'client') {
        memoryStore.clientProfiles.push({
          clientId,
          name,
          email: normalizedEmail,
          age: age || 30,
          riskTolerance: riskTolerance || 'moderate',
          riskScore: 7,
          timeHorizonYears: 10,
          liquidityNeeds: 'medium',
          goals: goals || ['retirement'],
          targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
          lifeEvents: [],
          holdings: [],
          totalValue: 0,
          performancePct: 0,
          performance: [0],
          activePlan: 'Growth Focus',
          nextMilestone: 'Initial Review',
          status: 'Active',
          lastActivity: 'Just now',
          accentColor: '#C9A227',
          latestTrace: null,
        });
      }

      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: `Account created successfully as ${role} (In-Memory).`,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          clientId: newUser.clientId,
        },
      });
    }
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: err.message,
    });
  }
}

// @desc    Login User (Manager or Client)
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbStatus.connected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Check role if specified in login form
      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as a ${user.role}, not as a ${role}.`,
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}.`,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        },
      });
    } else {
      // In-Memory Fallback
      const user = memoryStore.users.find((u) => u.email === normalizedEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as a ${user.role}, not as a ${role}.`,
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}.`,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        },
      });
    }
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: err.message,
    });
  }
}

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user,
      dbStatus: {
        connected: dbStatus.connected,
        usingFallback: dbStatus.usingFallback,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Could not fetch current session.',
      error: err.message,
    });
  }
}

// @desc    Seed Initial Demo Data into MongoDB
// @route   POST /api/auth/seed
// @access  Public
export async function seedDemoData(req, res) {
  try {
    if (!dbStatus.connected) {
      return res.json({
        success: true,
        message: 'Operating with built-in in-memory demo data.',
        counts: {
          users: memoryStore.users.length,
          clients: memoryStore.clientProfiles.length,
        },
      });
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.json({
        success: true,
        message: 'Database already has data. Skipping seed.',
      });
    }

    // Seed Manager
    await User.create({
      name: 'Lokesh V',
      email: 'manager@meridian.com',
      password: 'admin123',
      role: 'manager',
      title: 'Senior Wealth Director',
    });

    // Seed Clients
    const seededClients = [
      {
        name: 'Ananya Rao',
        email: 'ananya@meridian.com',
        password: 'client123',
        clientId: 'C001',
        age: 34,
        riskTolerance: 'moderate',
        riskScore: 7,
        holdings: [
          { ticker: 'SBIN', custodian: 'Groww', quantity: 50, assetClass: 'equity', price: 820 },
          { ticker: 'BONDFUND', custodian: 'HDFC Securities', quantity: 100, assetClass: 'bonds', price: 100 },
        ],
        totalValue: 51000,
      },
      {
        name: 'Lokesh',
        email: 'lokesh@meridian.com',
        password: 'client123',
        clientId: 'C002',
        age: 20,
        riskTolerance: 'moderate',
        riskScore: 7,
        holdings: [
          { ticker: 'SBIN', custodian: 'ICICI Direct', quantity: 50, assetClass: 'equity', price: 820 },
        ],
        totalValue: 41000,
      },
    ];

    for (const c of seededClients) {
      await User.create({
        name: c.name,
        email: c.email,
        password: c.password,
        role: 'client',
        clientId: c.clientId,
      });

      await ClientProfile.create({
        clientId: c.clientId,
        name: c.name,
        email: c.email,
        age: c.age,
        riskTolerance: c.riskTolerance,
        riskScore: c.riskScore,
        holdings: c.holdings,
        totalValue: c.totalValue,
        targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
      });
    }

    return res.json({
      success: true,
      message: 'Database successfully seeded with default manager and clients.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed database.',
      error: err.message,
    });
  }
}

// Automatically seed Atlas database if connected and empty
export async function autoSeedDatabase() {
  try {
    if (!dbStatus.connected) return;
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('[MongoDB Atlas] Empty database detected. Seeding initial accounts...');

    // Seed Manager
    await User.create({
      name: 'Lokesh V',
      email: 'manager@meridian.com',
      password: 'admin123',
      role: 'manager',
      title: 'Senior Wealth Director',
    });

    // Seed Rakesh
    await User.create({
      name: 'Rakesh',
      email: 'lokzx069@gmail.com',
      password: 'client123',
      role: 'client',
      clientId: 'C004',
    });
    await User.create({
      name: 'Rakesh',
      email: 'lokzx@gmail.com',
      password: 'client123',
      role: 'client',
      clientId: 'C004',
    });
    await ClientProfile.create({
      clientId: 'C004',
      name: 'Rakesh',
      email: 'lokzx069@gmail.com',
      age: 30,
      riskTolerance: 'moderate',
      riskScore: 7,
      holdings: [],
      totalValue: 0,
      targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
      goals: ['retirement'],
    });

    // Seed Ananya
    await User.create({
      name: 'Ananya Rao',
      email: 'ananya@meridian.com',
      password: 'client123',
      role: 'client',
      clientId: 'C001',
    });
    await ClientProfile.create({
      clientId: 'C001',
      name: 'Ananya Rao',
      email: 'ananya@meridian.com',
      age: 34,
      riskTolerance: 'moderate',
      riskScore: 7,
      holdings: [
        { ticker: 'SBIN', custodian: 'Groww', quantity: 50, assetClass: 'equity', price: 820 },
        { ticker: 'BONDFUND', custodian: 'HDFC Securities', quantity: 100, assetClass: 'bonds', price: 100 },
      ],
      totalValue: 51000,
      targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
      goals: ['retirement', 'child_education'],
    });

    // Seed Lokesh
    await User.create({
      name: 'Lokesh',
      email: 'lokesh@meridian.com',
      password: 'client123',
      role: 'client',
      clientId: 'C002',
    });
    await ClientProfile.create({
      clientId: 'C002',
      name: 'Lokesh',
      email: 'lokesh@meridian.com',
      age: 20,
      riskTolerance: 'moderate',
      riskScore: 7,
      holdings: [
        { ticker: 'SBIN', custodian: 'ICICI Direct', quantity: 50, assetClass: 'equity', price: 820 },
      ],
      totalValue: 41000,
      targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
      goals: ['retirement', 'child_education'],
    });

    console.log('[MongoDB Atlas] Auto-seeding completed successfully!');
  } catch (err) {
    console.error('[MongoDB Atlas Auto-Seed Error]', err.message);
  }
}
