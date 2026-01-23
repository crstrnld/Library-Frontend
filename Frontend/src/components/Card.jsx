import React from 'react';

export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`glass rounded-xl border border-white/20 p-6 shadow-soft ${
        hover ? 'hover:shadow-medium transition-smooth' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}