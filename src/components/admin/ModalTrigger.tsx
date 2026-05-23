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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                Cancel
              </button>
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
