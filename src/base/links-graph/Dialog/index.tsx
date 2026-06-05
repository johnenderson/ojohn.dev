'use client';

import { Layout } from '@/base/links-graph/Layout';

type DialogPropsType = {
  open: boolean;
  onClose: () => void;
  title?: string;
  content: string;
};

export const Dialog = ({ onClose, open, title, content }: DialogPropsType) => {
  if (!open) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <div
        role="presentation"
        className="bg-[#222] text-white w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded light:bg-white light:text-black"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Layout title={title}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Layout>
      </div>
    </div>
  );
};
