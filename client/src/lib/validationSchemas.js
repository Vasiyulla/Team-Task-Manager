import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'member']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const createProjectSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color').optional(),
});

export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  status: z.enum(['todo', 'in-progress', 'done', 'overdue']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().optional(),
});

export const commentSchema = z.object({
  body: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must not exceed 2000 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
});
