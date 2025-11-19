import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const { login, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard'); // Giriş başarılıysa dashboard'a yönlendir
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test hesabı: test@example.com / 123456
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="form-label">
              {t('auth.email')}
            </label>
            <input
              {...register('email', {
                required: 'Email gereklidir',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Geçerli bir email adresi girin'
                }
              })}
              type="email"
              className="form-input"
              placeholder="test@example.com"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <input
              {...register('password', {
                required: 'Şifre gereklidir'
              })}
              type="password"
              className="form-input"
              placeholder="123456"
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Giriş yapılıyor...' : t('auth.login')}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-500"
            >
              Hesabınız yok mu? Kayıt olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;