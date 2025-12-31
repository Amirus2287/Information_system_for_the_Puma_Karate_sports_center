import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <select
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select