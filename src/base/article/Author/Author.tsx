import { FC } from 'react';

import { authorNameStyle } from './styles';

type AuthorPropTypes = {
  name?: string;
};

export const Author: FC<AuthorPropTypes> = ({ name = 'John Enderson' }) => (
  <span
    className="author"
    itemProp="author"
    itemScope
    itemType="https://schema.org/Person"
  >
    <span itemProp="name" style={authorNameStyle}>
      {name}
    </span>
  </span>
);
