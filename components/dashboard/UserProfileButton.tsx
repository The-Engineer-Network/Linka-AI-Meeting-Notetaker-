import React from 'react';

interface UserProfileButtonProps {
  className?: string;
  onClick?: () => void;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  className = '',
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
    >
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">U</span>
      </div>
      <span className="text-sm text-gray-700 hidden sm:block">Profile</span>
    </button>
  );
};