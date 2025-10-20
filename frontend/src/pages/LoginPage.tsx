import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Alert } from '../components/common';
import { apiService } from '../services/api';
import { LoginRequest } from '../types';
import { User } from '../types';

type LoginPageProps = {
  onLogin: (user: User, token: string) => void;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = '이메일을 입력하세요';
    if (!formData.password) newErrors.password = '비밀번호를 입력하세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await apiService.login(formData);
      // call parent handler if provided so App can update auth state
      if (onLogin) {
        onLogin(response.user, response.accessToken);
      } else {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      navigate('/posts');
    } catch (error: any) {
      setApiError(error.response?.data?.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-6 text-center">로그인</h1>

          {apiError && (
            <Alert
              type="error"
              message={apiError}
              onClose={() => setApiError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              로그인
            </Button>
          </form>

          <p className="mt-4 text-center text-secondary-600">
            계정이 없으신가요?{' '}
            <a href="/register" className="text-primary-600 font-semibold hover:underline">
              회원가입
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
