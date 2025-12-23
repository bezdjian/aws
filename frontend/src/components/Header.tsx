import React from "react";
import { Calculator, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/home")}
          >
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <Calculator size={18} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-slate-800">
              EightyTwenty.
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 pr-6 border-r border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-wider">
                  {user?.getName()}
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">
                  {user?.getEmail()}
                </p>
              </div>
              <img
                src={user?.getImageUrl()}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-slate-200 ring-4 ring-slate-50"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).src = `https://ui-avatars.com/api/?name=${user?.getName()}&background=0f172a&color=fff`;
                }}
              />
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-500 transition-colors flex items-center space-x-2"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold hidden sm:block">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
