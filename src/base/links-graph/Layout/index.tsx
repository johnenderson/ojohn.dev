'use client';

import { FC, PropsWithChildren } from 'react';

type LayoutPropTypes = {
  title?: string;
};

export const Layout: FC<PropsWithChildren<LayoutPropTypes>> = ({
  children,
  title,
}) => (
  <div className="content">
    <article
      className="post"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      {title ? (
        <header>
          <p className="tracking-[0.01em] text-[2em] not-italic font-bold text-site-foreground block mt-0 mb-0 normal-case leading-[1.25]">
            {title}
          </p>
        </header>
      ) : null}
      {children}
    </article>
  </div>
);
