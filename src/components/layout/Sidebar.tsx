import React, { useEffect, useState, useRef, cloneElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  HomeIcon,
  ListIcon,
  QrCodeIcon,
  Table2Icon,
  SettingsIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";
const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [expanded, setExpanded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Check if item is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
  };

  // Media query for responsive behavior
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleResize = (e: MediaQueryListEvent) => {
      setExpanded(false);
    };
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Navigation items
  const navItems = [
    {
      path: "/",
      label: "Inicio",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      path: "/admin",
      label: "Admin Manager",
      icon: <ListIcon className="h-5 w-5" />,
    },
    {
      path: "/leads",
      label: "Leads",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      path: "/qr",
      label: "QR Manager",
      icon: <QrCodeIcon className="h-5 w-5" />,
    },
    {
      path: "/tabulator",
      label: "Tabulator",
      icon: <Table2Icon className="h-5 w-5" />,
    },
    {
      path: "/settings",
      label: "Configuración",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];
  return (
    <aside
      ref={sidebarRef}
      className={`bg-[#FEFEEB] text-[#023828] h-screen sticky top-0 left-0 border-r border-[rgba(0,0,0,0.06)] transition-all duration-200 ease-in-out ${expanded ? "w-64" : "w-[72px]"}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      tabIndex={0}
      aria-expanded={expanded}
    >
      <div className="bg-[#023828] flex items-center justify-center px-4 py-5 h-[80px]">
        {expanded ? (
          <img
            src="/even-assets/logo-even.png"
            alt="Even"
            className="object-contain h-8"
          />
        ) : (
          <img
            src="/even-assets/asterisk-grass.png"
            alt="Even"
            className="object-contain h-8 w-8"
          />
        )}
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center px-3 py-3 transition-all relative ${isActive(item.path) ? "bg-[rgba(2,56,40,0.08)] text-[#023828] font-medium border-l-[3px] border-[#023828]" : "hover:bg-[rgba(2,56,40,0.06)] text-[#023828] border-l-[3px] border-transparent"}`}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                <span className="flex items-center">
                  {cloneElement(item.icon as React.ReactElement, {
                    className: `h-5 w-5 text-[#023828]`,
                  })}
                </span>
                <span
                  className={`ml-3 whitespace-nowrap ${expanded ? "opacity-100" : "opacity-0 absolute"} transition-opacity duration-150`}
                >
                  {item.label}
                </span>
                {!expanded && (
                  <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-[#023828]">
        <button
          onClick={handleSignOut}
          className={`flex items-center w-full px-3 py-3 hover:bg-[rgba(2,56,40,0.06)] text-[#023828] transition-all`}
        >
          <LogOutIcon className="h-5 w-5" />
          <span
            className={`ml-3 whitespace-nowrap ${expanded ? "opacity-100" : "opacity-0 absolute"} transition-opacity duration-150`}
          >
            Cerrar sesión
          </span>
          {!expanded && (
            <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Cerrar sesión
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
