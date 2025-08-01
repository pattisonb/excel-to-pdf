import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  interactive?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  size?: 'default' | 'compact' | 'large';
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  size?: 'default' | 'compact' | 'large';
  className?: string;
}

interface CardImageProps {
  src: string;
  alt: string;
  size?: 'default' | 'small' | 'large';
  className?: string;
}

export function Card({ 
  children, 
  variant = 'default', 
  interactive = false, 
  loading = false, 
  onClick, 
  className = '' 
}: CardProps) {
  const baseClass = styles.card;
  const variantClass = variant !== 'default' ? styles[variant] : '';
  const interactiveClass = interactive ? styles.interactive : '';
  const loadingClass = loading ? styles.loading : '';
  
  const combinedClasses = [
    baseClass,
    variantClass,
    interactiveClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ children, title, subtitle, className = '' }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className}`}>
      {title && <h3 className={styles.headerTitle}>{title}</h3>}
      {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      {children}
    </div>
  );
}

export function CardBody({ children, size = 'default', className = '' }: CardBodyProps) {
  const sizeClass = size !== 'default' ? styles[`body${size.charAt(0).toUpperCase() + size.slice(1)}`] : styles.body;
  
  return (
    <div className={`${sizeClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, size = 'default', className = '' }: CardFooterProps) {
  const sizeClass = size !== 'default' ? styles[`footer${size.charAt(0).toUpperCase() + size.slice(1)}`] : styles.footer;
  
  return (
    <div className={`${sizeClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardImage({ src, alt, size = 'default', className = '' }: CardImageProps) {
  const sizeClass = size !== 'default' ? styles[`image${size.charAt(0).toUpperCase() + size.slice(1)}`] : styles.image;
  
  return (
    <img src={src} alt={alt} className={`${sizeClass} ${className}`} />
  );
}

// Grid container for cards
interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, columns = 2, className = '' }: CardGridProps) {
  const gridClass = styles[`grid${columns}`];
  
  return (
    <div className={`${styles.grid} ${gridClass} ${className}`}>
      {children}
    </div>
  );
} 