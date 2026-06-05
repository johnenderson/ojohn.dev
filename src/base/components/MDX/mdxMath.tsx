import React from 'react';

import { InlineMath, BlockMath } from 'react-katex';

/** Coerce MDX children to a string so KaTeX receives a string (it throws on non-string). */
export function mathChildrenToString(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (children == null) return '';
  if (Array.isArray(children))
    return children.map(mathChildrenToString).join('');
  if (
    React.isValidElement(children) &&
    (children.props as { children?: React.ReactNode })?.children != null
  ) {
    return mathChildrenToString(
      (children.props as { children: React.ReactNode }).children,
    );
  }
  return String(children);
}

/** Wrapper so InlineMath always gets a string (MDX can pass React nodes as children). */
export const SafeInlineMath = (props: {
  math?: string;
  children?: React.ReactNode;
}) => <InlineMath math={props.math ?? mathChildrenToString(props.children)} />;

/** Wrapper so BlockMath always gets a string (MDX can pass React nodes as children). */
export const SafeBlockMath = (props: {
  math?: string;
  children?: React.ReactNode;
}) => <BlockMath math={props.math ?? mathChildrenToString(props.children)} />;
