'use client';

import { FC } from 'react';

type TitleProps = {
  text: string;
};

export const Title: FC<TitleProps> = ({ text }) => (
  <h1 className="m-0 block text-balance text-[2rem] font-bold leading-[1.08] tracking-normal text-site-foreground sm:text-[2.45rem]">
    {text}
  </h1>
);
