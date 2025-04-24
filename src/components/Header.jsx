import React, { useState } from 'react';
import { Home, Settings, MapPin, Menu, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccessControl } from '../customHooks/useAccessControl';

function Header({ activeTab }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { isFullAccess, isRestricted, locationId: accessLocationId } = useAccessControl();
  const [searchParams] = useSearchParams();

  // Determine the locationId from access control or fallback to URL param
  const locationId = accessLocationId || searchParams.get('locationId');
  console.log("is header full access: ", isFullAccess)
  console.log("is headerlocationId access: ", locationId)
  console.log("is header isRestricted access: ", isRestricted)

  const handleNavigate = (path) => {
    setMenuOpen(false); // Close menu on nav
    navigate(path);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="https://msgsndr-private.storage.googleapis.com/companyPhotos/399c65a9-7382-44b4-b8eb-8632ba9d5e7a.png" alt="Logo" className="w-full h-10" />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => handleNavigate(`/?locationId=${locationId}`)}
            />
            <NavItem
              icon={<MapPin size={20} />}
              label="All Properties"
              active={activeTab === 'properties'}
              onClick={() => handleNavigate(`/properties?locationId=${locationId}`)}
            />
            {isFullAccess &&(
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => handleNavigate(`/settings?locationId=${locationId}`)}
            />
          )}
          </nav>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => handleNavigate(`/?locationId=${locationId}`)}
              mobile
            />
            <NavItem
              icon={<MapPin size={20} />}
              label="All Properties"
              active={activeTab === 'properties'}
              onClick={() => handleNavigate(`/properties?locationId=${locationId}`)}
              mobile
            />
            {isFullAccess &&(
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === `settings`}
              onClick={() => handleNavigate(`/settings?locationId=${locationId}`)}
              mobile
            />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavItem({ icon, label, active, onClick, mobile = false }) {
  const baseClasses =
    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200';
  const activeClasses = 'text-primary border-b-2 border-primary';
  const inactiveClasses = 'text-gray-600 hover:text-secondary';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${
        mobile ? 'w-full text-left' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Header;
