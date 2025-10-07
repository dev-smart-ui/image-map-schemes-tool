'use client'

import classNames from "classnames"
import { ReactNode } from "react"

export const Button = ({
  children,
  onClick = () => {},
  type = 'default',
  className = '',
  disabled = false,
  withIcon = false,
}: {
  children: ReactNode,
  onClick?: () => void,
  type?: 'default' | 'secondary' | 'success' | 'icon',
  className?: string,
  disabled?: boolean,
  withIcon?: boolean
}) => {
  return (
    <button 
      className={classNames('px-4 py-2 hover:opacity-80 text-black cursor-pointer text-[14px] text-white rounded-lg', {
        'bg-[var(--accent-color)]': type == 'default',
        'bg-[var(--accent-light-color)] !text-black': type == 'secondary',
        'bg-[var(--success-color)]': type == 'success',
        'bg-[var(--accent-light-color)] !text-black !px-2': type == 'icon',
        'opacity-40 pointer-events-none': (disabled),
        'flex items-center gap-2': (withIcon),
      }, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
