import { cn } from '../../lib/utils'

interface TableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export default function Table({ headers, children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse', className)}>
        <thead>
          <tr className="border-b">
            {headers.map((header) => (
              <th key={header} className="text-left py-3 px-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}