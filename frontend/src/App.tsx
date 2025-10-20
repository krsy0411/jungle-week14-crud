import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout";
import { LoadingSpinner } from "./components/common";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PostsPage } from "./pages/PostsPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { PostCreatePage } from "./pages/PostCreatePage";
import { PostEditPage } from "./pages/PostEditPage";
import { User } from "./types";

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isLoggedIn,
  children,
}) => {
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
        {isInitializing ? (
          <LoadingSpinner />
        ) : (
          <Routes>
            {/* 공개 라우트 */}
            <Route
              path="/"
              element={
                <Navigate to={isLoggedIn ? "/posts" : "/login"} replace />
              }
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLoginSuccess} />}
            />
            <Route path="/register" element={<RegisterPage />} />

            {/* 보호된 라우트 */}
            <Route
              path="/posts"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <PostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/create"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <PostCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:postId/edit"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <PostEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:postId"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <PostDetailPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <Navigate to={isLoggedIn ? "/posts" : "/login"} replace />
              }
            />
          </Routes>
        )}
      </Layout>
    </Router>
  );
};

export default App;
