import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold hover:opacity-90">
          🚀 ThisTimeNull의 게시판 놀이터
        </Link>

        <nav className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link to="/posts" className="hover:opacity-90 transition">
                게시글
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  navigate("/login");
                }}
                className="px-4 py-2 bg-white text-primary-600 rounded hover:bg-primary-50 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:opacity-90 transition">
                로그인
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-primary-600 rounded hover:bg-primary-50 transition"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
