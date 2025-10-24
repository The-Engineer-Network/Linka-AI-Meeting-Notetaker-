import React from 'react';
import Link from 'next/link';

interface NavigationBarProps {
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ className = '' }) => {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/archive', label: 'Archive' },
    { href: '/profile', label: 'Profile' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className={`flex space-x-6 ${className}`}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};