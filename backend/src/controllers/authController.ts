import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../services/dbService';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable must be set in production mode!');
    }
    console.warn('⚠️ WARNING: JWT_SECRET is not configured. Using development fallback key.');
    return 'supersecret_jwt_key_carbonwise_ai';
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  carbonGoal: z.number().min(10).max(10000).optional(),
  greenCoins: z.number().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, { message: 'New password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'New password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'New password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'New password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'New password must contain at least one special character' })
});

export const authController = {
  async register(req: any, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const { name, email, password } = parsed.data;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        carbonGoal: 500, // default 500 kg CO2
        greenCoins: 100, // signup bonus
        streak: 0,
        lastLoggedDate: '',
        badges: []
      });

      const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          carbonGoal: newUser.carbonGoal,
          greenCoins: newUser.greenCoins,
          streak: newUser.streak,
          badges: newUser.badges
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error during registration.', message: error.message });
    }
  },

  async login(req: any, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const { email, password } = parsed.data;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          carbonGoal: user.carbonGoal,
          greenCoins: user.greenCoins,
          streak: user.streak,
          badges: user.badges
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error during login.', message: error.message });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserRepository.findById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        carbonGoal: user.carbonGoal,
        greenCoins: user.greenCoins,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error fetching profile.', message: error.message });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const updated = await UserRepository.updateById(req.userId!, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          carbonGoal: updated.carbonGoal,
          greenCoins: updated.greenCoins,
          streak: updated.streak,
          badges: updated.badges
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error updating profile.', message: error.message });
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.format() });
      }

      const { currentPassword, newPassword } = parsed.data;

      const user = await UserRepository.findById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await UserRepository.updateById(req.userId!, { password: newHashedPassword });

      return res.json({ message: 'Password changed successfully.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Server error updating password.', message: error.message });
    }
  }
};
