'use client'

import classNames from 'classnames'
import { ReactNode } from 'react'
import { Button } from '../buttons/Button'

export const Modal = ({
  isOpen,
  title,
  children,
  acceptLabel,
  cancelLabel,
  onAccept,
  onCancel,
  onClose,
}: {
  isOpen: boolean,
  title: string,
  children: ReactNode,
  acceptLabel?: string,
  cancelLabel?: string,
  onAccept?: () => void,
  onCancel?: () => void,
  onClose?: () => void,
}) => {
  if (!title || !children) {
    return <></>
  }

  return (
    <div className={classNames('fixed top-0 left-0 w-full h-full bg-[var(--overlay-color)] flex z-10 opacity-0 pointer-events-none', {
      'opacity-100 !pointer-events-auto duration-300': isOpen
    })}>
      <div className="m-auto w-full max-w-[800px] bg-white p-4 rounded-lg flex flex-col">
        <div className="font-bold text-[18px] flex justify-between items-center gap-2">
          {title}

          <Button type="icon" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="border-t border-[var(--primary-color)] pt-2 mt-2 text-[14px] max-h-[500px] overflow-auto">
          {children}
        </div>
        
        { (acceptLabel || cancelLabel) && (
          <div className="flex items-center justify-end gap-4 mt-8">
            { cancelLabel && (     
              <Button 
                onClick={onCancel}
                type="secondary"
              >
                {cancelLabel}
              </Button>
            )}

            { acceptLabel && (     
              <Button 
                type="success" 
                onClick={onAccept}
              >
                {acceptLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
