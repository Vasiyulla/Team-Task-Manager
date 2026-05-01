import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.jsx';
import { loginSchema } from '../lib/validationSchemas.js';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Workflow } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
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
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Sign in to your account to continue
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-slate-300 text-violet-600"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={isLoading}
            >
              Sign in
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-slate-500 dark:text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 to-indigo-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Workflow size={32} />
            </div>
            <h2 className="text-4xl font-bold mb-2">Task Manager</h2>
            <p className="text-violet-100">
              Premium team collaboration for modern teams
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-violet-100">
                Organize tasks into projects with your team
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-violet-100">
                Drag and drop tasks to manage workflow
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-violet-100">
                Collaborate with real-time comments and updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
