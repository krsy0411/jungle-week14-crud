import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-secondary-300 text-sm">
              깔끔한 게시판 애플리케이션으로 게시글과 댓글을 관리하세요.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Link</h3>
            <ul className="text-secondary-300 text-sm space-y-1">
              <li><Link to="/posts" className="hover:text-white">게시글</Link></li>
              <li><Link to="/profile" className="hover:text-white">내 정보</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Contact</h3>
            <p className="text-secondary-300 text-sm">
              문제가 있으신가요? ThisTimeNull에게 연락하세요.
            </p>
          </div>
        </div>
        <div className="border-t border-secondary-700 pt-4 text-center text-secondary-300 text-sm">
          <p>&copy; 2025 Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
