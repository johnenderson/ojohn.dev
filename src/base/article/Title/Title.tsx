'use client';

import { FC } from 'react';

type TitleProps = {
  text: string;
};

export const Title: FC<TitleProps> = ({ text }) => (
  <h1 className="tracking-normal text-[2rem] sm:text-[2.55rem] not-italic font-bold text-site-foreground mt-0 mb-0 normal-case leading-[1.08] block text-balance">
    {text}
  </h1>
);
