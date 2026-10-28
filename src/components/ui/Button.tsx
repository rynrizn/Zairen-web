import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-none';

    const variants = {
      primary:
        'bg-[#dc143c] hover:bg-[#ff2d55] text-white shadow-[0_4px_20px_rgba(220,20,60,0.35)] active:scale-[0.98]',
      secondary:
        'bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] border border-white/[0.08] active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-[#e5e2e1] border border-white/[0.15] hover:border-[#dc143c] hover:text-[#ffb3b3] active:scale-[0.98]',
      danger:
        'bg-[#93000a] hover:bg-[#ff5449] text-white shadow-[0_2px_12px_rgba(147,0,10,0.4)] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs tracking-wider uppercase font-mono',
      md: 'px-5 py-2.5 text-sm tracking-wider uppercase font-mono',
      lg: 'px-7 py-3.5 text-base tracking-wider uppercase font-mono',
      icon: 'w-10 h-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(
          clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
