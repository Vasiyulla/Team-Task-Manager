import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.jsx';
import { signupSchema } from '../lib/validationSchemas.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Workflow, Check, X } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');

  const passwordStrength = {
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    isLongEnough: password?.length >= 6,
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await signup(data.name, data.email, data.password, data.role || 'member');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
              <Workflow size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Task Manager</h1>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Join us to start collaborating
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Password requirements:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.isLongEnough ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <X size={14} className="text-slate-400" />
                    )}
                    <span>At least 6 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasUppercase ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <X size={14} className="text-slate-400" />
                    )}
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.hasNumber ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <X size={14} className="text-slate-400" />
                    )}
                    <span>One number</span>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Account Role
              </label>
              <select
                {...register('role')}
                className="input-base w-full"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Admins can create projects and manage team members
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-slate-500 dark:text-slate-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-violet-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Ready to collaborate?</h2>
            <p className="text-indigo-100">
              Join teams around the world using Task Manager to organize and deliver their best work.
            </p>
          </div>

          {/* Testimonial-style text */}
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
            <p className="text-indigo-100 mb-4 italic">
              "Task Manager has transformed how our team manages projects. It's intuitive, powerful, and beautiful."
            </p>
            <p className="font-semibold text-white">
              Sarah Chen
            </p>
            <p className="text-indigo-200 text-sm">
              Product Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
