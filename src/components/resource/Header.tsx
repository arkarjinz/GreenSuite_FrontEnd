import React from "react";
import { UserCircle } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => (
  <header className="flex items-center justify-between px-5 py-3">
    <button
      onClick={onBack}
      aria-label="Go back"
      className="bg-green-700 text-white rounded-full w-8 h-8 text-xl flex items-center justify-center hover:bg-green-800 transition"
    >
      ←
    </button>

    <h1 className="text-xl md:text-2xl font-bold font-bebas">
      GREEN<span className="text-green-700">SUITE</span>
    </h1>

    <UserCircle
      className="w-7 h-7 text-green-700 cursor-pointer hover:text-green-800 transition"
      aria-label="Profile"
    />
  </header>
);

export default Header;
