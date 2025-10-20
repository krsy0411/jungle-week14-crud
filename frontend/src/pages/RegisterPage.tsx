import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Alert } from "../components/common";
import { apiService } from "../services/api";
import { RegisterRequest } from "../types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "passwordConfirm") {
      setPasswordConfirm(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "이메일을 입력하세요";
    if (!formData.username) newErrors.username = "사용자명을 입력하세요";
    if (!formData.password) newErrors.password = "비밀번호를 입력하세요";
    if (formData.password !== passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      await apiService.register(formData);
      setSuccess("회원가입에 성공했습니다. 로그인해주세요.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "회원가입에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-6 text-center">
            회원가입
          </h1>

          {apiError && (
            <Alert
              type="error"
              message={apiError}
              onClose={() => setApiError("")}
            />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess("")}
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
              label="사용자명"
              type="text"
              name="username"
              placeholder="사용자명을 입력하세요"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
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

            <Input
              label="비밀번호 확인"
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={handleChange}
              error={errors.passwordConfirm}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              회원가입
            </Button>
          </form>

          <p className="mt-4 text-center text-secondary-600">
            이미 계정이 있으신가요?{" "}
            <a
              href="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              로그인
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
