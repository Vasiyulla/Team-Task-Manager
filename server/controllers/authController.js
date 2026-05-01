import { User } from '../models/index.js';
import { hashPassword, verifyPassword, generateTokens } from '../utils/auth.js';

/**
 * POST /api/auth/signup
 * Register a new user
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'member',
      avatar: name.substring(0, 2).toUpperCase(), // Initials
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided',
      });
    }

    // Verify refresh token
    const { verifyRefreshToken } = await import('../utils/auth.js');
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      // Clear invalid token
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate new tokens
    const newTokens = generateTokens(user.id, user.role);

    // Update refresh token in cookie
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
};

/**
 * POST /api/auth/logout
 * Clear refresh token cookie
 */
export const logout = (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};
