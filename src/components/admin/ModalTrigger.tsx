"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalTrigger({ 
  buttonText, 
  title, 
  message = "This feature will be available in the next release.", 
  className = "" 
}: { buttonText: React.ReactNode, title: string, message?: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                Cancel
              </button>
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm hover:shadow-md">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
