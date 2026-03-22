import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  alt?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function Avatar({
  src,
  name,
  size = 'md',
  alt,
  className,
  ...props
}: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden',
        'bg-[#8B1D4F] text-white font-semibold select-none',
        sizeClasses[size],
        className,
      )}
      aria-label={alt ?? name ?? 'Avatar'}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  )
}
