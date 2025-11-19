import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    console.log('📝 Login form submitted:', data);
    const result = await login(data.email, data.password);
    console.log('📝 Login result:', result);
    
    if (result.success) {
      console.log('✅ Login successful, navigating to /');
      navigate('/'); // Ana sayfaya yönlendir
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Giriş Yap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Test hesabı: <strong>test@example.com</strong> / <strong>123456</strong>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="form-label">Email</label>
            <input
              {...register('email', { required: 'Email gereklidir' })}
              type="email"
              className="form-input"
              placeholder="test@example.com"
              defaultValue="test@example.com"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label">Şifre</label>
            <input
              {...register('password', { required: 'Şifre gereklidir' })}
              type="password"
              className="form-input"
              placeholder="123456"
              defaultValue="123456"
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Hesabınız yok mu? Kayıt olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;