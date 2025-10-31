import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
