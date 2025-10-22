import React, { useState } from "react";

type Props = {
  onSearch: (q?: string) => void;
  placeholder?: string;
};

export const SearchBox: React.FC<Props> = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    onSearch(q === "" ? undefined : q);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <input
        className="border rounded px-3 py-2 flex-1 text-sm"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "게시글 제목으로 검색"}
      />
      <button
        type="submit"
        className="bg-primary-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
      >
        검색
      </button>
    </form>
  );
};

export default SearchBox;
