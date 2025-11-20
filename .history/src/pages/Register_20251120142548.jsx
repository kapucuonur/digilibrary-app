import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Register = () => {
  const { register: registerUser, loading } = useAuth(); // 👈 registerUser buradan geliyor
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    console.log('📝 Form submitted:', data);
    const result = await registerUser(data); // 👈 Bu satır hata veriyor
    console.log('✅ Register result:', result);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                {t('auth.firstName')}
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="form-input"
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="form-error">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">
                {t('auth.lastName')}
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="form-input"
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="form-error">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              {t('auth.email')}
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="form-label">
              {t('auth.phone')}
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="form-input"
              placeholder="Phone number (optional)"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type="password"
              className="form-input"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              {t('auth.confirmPassword')}
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              type="password"
              className="form-input"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? <LoadingSpinner size="sm" /> : t('auth.register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;