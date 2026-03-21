import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#8B1D4F] text-white hover:bg-[#7a1944] active:bg-[#6b1639] focus-visible:ring-[#8B1D4F]',
  secondary:
    'border border-[#8B1D4F] text-[#8B1D4F] bg-transparent hover:bg-[#8B1D4F]/5 active:bg-[#8B1D4F]/10 focus-visible:ring-[#8B1D4F]',
  ghost:
    'text-[#8B1D4F] bg-transparent hover:bg-[#8B1D4F]/5 active:bg-[#8B1D4F]/10 focus-visible:ring-[#8B1D4F]',
  gold: 'bg-[#C9973F] text-white hover:bg-[#b8872f] active:bg-[#a77820] focus-visible:ring-[#C9973F]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
