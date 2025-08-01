import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseClass = styles.button;
  const variantClass = styles[variant];
  const sizeClass = size !== 'medium' ? styles[size] : '';
  const iconClass = icon ? styles.icon : '';
  const loadingClass = loading ? styles.loading : '';
  
  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    iconClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
} 