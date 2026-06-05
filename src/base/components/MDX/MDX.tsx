import rehypeShiki from '@shikijs/rehype';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import TweetEmbed from 'react-tweet-embed';
import remarkGfm from 'remark-gfm';

import { SafeBlockMath, SafeInlineMath } from './mdxMath';
import { codeBlockMetaTransformer } from '@/base/components/MDX/codeBlockMeta';
import { PostAndDate } from '@/base/components/PostAndDate';
import { SideBySideImages } from '@/base/components/SideBySideImages';
import { SideBySideVideos } from '@/base/components/SideBySideVideos';
import { SmoothRender } from '@/base/components/SmoothRender';
import { Venn } from '@/base/components/Venn';

export type Content = MDXRemoteSerializeResult<
  Record<string, unknown>,
  Record<string, unknown>
>;

interface MDXPropTypes {
  content: Content;
}

const rehypeShikiOptions = {
  theme: 'rose-pine-moon',
  transformers: [codeBlockMetaTransformer],
};

export const serializeMDX = (content: string) =>
  serialize(content, {
    blockJS: false,
    mdxOptions: {
      rehypePlugins: [[rehypeShiki, rehypeShikiOptions]],
      remarkPlugins: [remarkGfm],
    },
  });

const components = {
  PostAndDate,
  SideBySideImages,
  TweetEmbed,
  SmoothRender,
  SideBySideVideos,
  InlineMath: SafeInlineMath,
  BlockMath: SafeBlockMath,
  Venn,
};

export const MDX = ({ content }: MDXPropTypes) => (
  <MDXRemote {...content} components={components} />
);
