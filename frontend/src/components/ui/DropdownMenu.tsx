import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuContent = DropdownMenuPrimitive.Content

export default function DropdownMenuExample() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Открыть</DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border rounded shadow p-2">
        <div>Меню</div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}