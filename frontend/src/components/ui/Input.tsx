import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'filled';
  error?: boolean;
  success?: boolean;
  label?: string;
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'default',
  error = false,
  success = false,
  label,
  helperText,
  icon,
  className = '',
  id,
  name,
  autoComplete,
}: InputProps) {
  const baseClass = styles.input;
  const sizeClass = size !== 'medium' ? styles[size] : '';
  const variantClass = variant !== 'default' ? styles[variant] : '';
  const errorClass = error ? styles.error : '';
  const successClass = success ? styles.success : '';
  
  const inputClasses = [
    baseClass,
    sizeClass,
    variantClass,
    errorClass,
    successClass,
    className
  ].filter(Boolean).join(' ');

  const helperTextClass = error ? `${styles.helperText} ${styles.error}` : 
                         success ? `${styles.helperText} ${styles.success}` : 
                         styles.helperText;

  const inputElement = (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      className={inputClasses}
    />
  );

  const inputWithIcon = icon ? (
    <div className={styles.inputWithIcon}>
      {inputElement}
      <span className={styles.inputIcon}>{icon}</span>
    </div>
  ) : inputElement;

  return (
    <div>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {inputWithIcon}
      {helperText && (
        <p className={helperTextClass}>{helperText}</p>
      )}
    </div>
  );
} 