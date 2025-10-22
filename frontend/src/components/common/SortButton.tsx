import React from 'react';
import { Button } from './Button';

type SortType = 'latest' | 'popular';

interface SortButtonProps {
  sortBy: SortType;
  onChange: (sortBy: SortType) => void;
}

/**
 * SortButton: 최신순/인기순 정렬 버튼 컴포넌트
 * - sortBy: 현재 선택된 정렬 방식 ('latest' | 'popular')
 * - onChange: 정렬 방식 변경 시 호출되는 콜백 함수
 */
export const SortButton: React.FC<SortButtonProps> = ({ sortBy, onChange }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={sortBy === 'latest' ? 'primary' : 'secondary'}
        onClick={() => onChange('latest')}
        className="px-4 py-2 text-sm"
      >
        최신순
      </Button>
      <Button
        variant={sortBy === 'popular' ? 'primary' : 'secondary'}
        onClick={() => onChange('popular')}
        className="px-4 py-2 text-sm"
      >
        인기순
      </Button>
    </div>
  );
};
