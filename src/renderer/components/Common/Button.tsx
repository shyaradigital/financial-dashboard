import React from 'react';
import classNames from 'classnames';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  ...props 
}) => {
  return (
    <button
      className={classNames('btn', `btn-${variant}`, `btn-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;


