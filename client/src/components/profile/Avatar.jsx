import { motion } from 'framer-motion'

export default function Avatar({ name, image, size = 'lg', className = '' }) {
  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-xl',
    lg: 'h-24 w-24 text-3xl',
    xl: 'h-32 w-32 text-4xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`shrink-0 overflow-hidden rounded-full ring-2 ring-slate-700/50 ${sizeClasses[size]} ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 font-semibold text-white">
          {initials}
        </div>
      )}
    </motion.div>
  )
}