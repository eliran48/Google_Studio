import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Add onClick prop to allow cards to be clickable, fixing type errors in parent components.
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
