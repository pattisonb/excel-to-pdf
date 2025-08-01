"use client";
import React from 'react';
import styles from './DarkModeToggle.module.css';

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function DarkModeToggle({ isDark, onToggle }: DarkModeToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <button 
        className={`${styles.toggle} ${isDark ? styles.dark : ''}`}
        onClick={onToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className={`${styles.icon} ${isDark ? styles.sunIcon : styles.moonIcon}`}>
          {isDark ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  );
} 