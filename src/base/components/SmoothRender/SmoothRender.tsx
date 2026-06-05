'use client';

import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';

import { useInView } from 'react-intersection-observer';

interface SmoothRenderPropTypes {
  children: ReactElement[];
}

interface SmoothRenderElementPropTypes {
  children: ReactElement;
}

const HEADERS = ['h2', 'h3', 'h4'];

interface Text {
  props: {
    children: Text;
  };
}

type Children = string | Text | (string | Text)[];

function slugify(children: Children): string {
  if (Array.isArray(children)) {
    return children.map((child) => slugify(child)).join('-');
  }

  if (typeof children === 'object') {
    return slugify(children.props.children);
  }

  return children
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replaceAll('_', '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-/, '')
    .replace(/\-$/g, '');
}

const HTML_ATTR_MAP: Record<string, string> = {
  class: 'className',
  allowfullscreen: 'allowFullScreen',
  crossorigin: 'crossOrigin',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  enctype: 'encType',
  usemap: 'useMap',
};

const BOOLEAN_STRING_ATTRS = new Set([
  'controls',
  'autoplay',
  'muted',
  'loop',
  'allowfullscreen',
  'allowFullScreen',
  'disabled',
  'checked',
  'selected',
  'multiple',
]);

function normalizeProps(
  props: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!props) return {};
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    const newKey = HTML_ATTR_MAP[key] ?? key;
    const newValue =
      BOOLEAN_STRING_ATTRS.has(key) && value === 'true' ? true : value;
    normalized[newKey] = newValue;
  }
  return normalized;
}

function normalizeElement(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  if (typeof node.type !== 'string') return node;

  const props = (node.props ?? {}) as Record<string, unknown>;
  const normalizedProps = normalizeProps(props);

  if (props.children != null) {
    normalizedProps.children = Children.map(
      props.children as ReactNode,
      normalizeElement,
    );
  }

  return createElement(node.type as string, normalizedProps);
}

const SmoothRenderElement = ({ children }: SmoothRenderElementPropTypes) => {
  const [render, setRender] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const type = children.type;
  const props = children.props as Record<string, unknown>;
  const id =
    typeof type === 'string' && HEADERS.includes(type)
      ? slugify(props.children as Children)
      : null;

  useEffect(() => {
    if (inView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRender(true);
    }
  }, [inView]);

  // Normalize HTML attrs (class→className, allowfullscreen→allowFullScreen, etc.)
  // Add id to headers for anchor links. Don't touch className — opacity lives on the wrapper.
  const normalized = normalizeElement(
    id
      ? cloneElement(children as ReactElement<Record<string, unknown>>, { id })
      : children,
  );

  return (
    <>
      <div ref={ref} style={{ minHeight: '0px', visibility: 'hidden' }} />
      <div
        className={[
          'transition-opacity ease-linear duration-[0.6s] delay-[0.124927s]',
          render ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        {normalized}
      </div>
    </>
  );
};

export const SmoothRender = ({ children }: SmoothRenderPropTypes) =>
  children.map((child, id) => (
    <SmoothRenderElement key={id}>{child}</SmoothRenderElement>
  ));
