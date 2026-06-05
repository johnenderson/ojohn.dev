'use client';

import { useEffect } from 'react';

import { Layout } from '@/base/links-graph/Layout';

type DialogPropsType = {
  open: boolean;
  onClose: () => void;
  title?: string;
  content: string;
};

export const Dialog = ({ onClose, open, title, content }: DialogPropsType) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        className="relative bg-[#222] text-white w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded light:bg-white light:text-black"
      >
        <Layout title={title}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Layout>
      </dialog>
    </div>
  );
};
