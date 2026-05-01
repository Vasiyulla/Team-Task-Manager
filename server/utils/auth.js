import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ========================================
// Password Hashing
// ========================================

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const verifyPassword = async (plainPassword, hash) => {
  return bcryptjs.compare(plainPassword, hash);
};

// ========================================
// JWT Token Generation & Verification
// ========================================

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

export const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

// ========================================
// Token Verification
// ========================================

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key');
  } catch (error) {
    return null;
  }
};

// ========================================
// Token Extraction from Header
// ========================================

export const extractTokenFromHeader = (header) => {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7); // Remove "Bearer " prefix
};
