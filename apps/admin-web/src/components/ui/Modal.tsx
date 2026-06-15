'use client';



import { ReactNode, useEffect } from 'react';

import { Button } from './Button';



interface ModalProps {

  open: boolean;

  onClose: () => void;

  title: string;

  children: ReactNode;

  size?: 'sm' | 'md' | 'lg';

}



export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {

  useEffect(() => {

    if (open) {

      document.body.style.overflow = 'hidden';

    } else {

      document.body.style.overflow = '';

    }

    return () => {

      document.body.style.overflow = '';

    };

  }, [open]);



  if (!open) return null;



  const sizes = {

    sm: 'max-w-md',

    md: 'max-w-lg',

    lg: 'max-w-2xl',

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className={`relative w-full ${sizes[size]} rounded-none bg-white shadow-xl`}>

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>

          <Button variant="ghost" size="sm" onClick={onClose}>

            ✕

          </Button>

        </div>

        <div className="px-6 py-4">{children}</div>

      </div>

    </div>

  );

}

