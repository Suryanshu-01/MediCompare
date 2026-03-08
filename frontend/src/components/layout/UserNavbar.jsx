import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/images/logo.jpeg";

export default function UserNavbar() {

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center h-16">

          {/* BRAND LOGO */}
          <div
            onClick={() => navigate("/user/dashboard")}
            className="cursor-pointer select-none flex items-center gap-3"
          >
            <img 
              src={logo} 
              alt="Medi-Compare Logo" 
              className="h-10 w-10 object-cover rounded-lg"
            />
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-blue-600">Medi</span>
              <span className="text-gray-900">Compare</span>
            </span>
          </div>

          {/* USER PROFILE */}
          <div className="flex items-center gap-4">

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </nav>
  );
}