
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  PlusCircle,
  LogOut,
} from "lucide-react";

export default function HospitalNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hospital, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/hospital/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Doctors",
      path: "/hospital/doctors",
      icon: <Stethoscope size={18} />,
    },
    {
      label: "Services",
      path: "/hospital/services",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Add Service",
      path: "/hospital/services/add",
      icon: <PlusCircle size={18} />,
    },
    {
      label: "Add Doctor",
      path: "/hospital/doctors/add",
      icon: <PlusCircle size={18} />,
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center h-16">

          {/* NAV LINKS */}
          <div className="flex items-center gap-2">

            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition

                  ${
                    active
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-4">

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {hospital?.hospitalName || "Hospital"}
              </p>
              <p className="text-xs text-gray-500">
                {hospital?.email || user?.email}
              </p>
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {hospital?.hospitalName?.charAt(0) || "H"}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}
