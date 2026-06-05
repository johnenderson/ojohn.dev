import rehypeShiki from '@shikijs/rehype';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { TweetEmbed } from './TweetEmbedClient';
import { codeBlockMetaTransformer } from './codeBlockMeta';
import { SafeBlockMath, SafeInlineMath } from './mdxMath';
import { ArticleImage } from '@/base/article/ArticleImage';
import {
  Admonition,
  Danger,
  Info,
  Note,
  Tip,
  Warning,
} from '@/base/components/Admonition';
import { PostAndDate } from '@/base/components/PostAndDate';
import { SideBySideImages } from '@/base/components/SideBySideImages';
import { SideBySideVideos } from '@/base/components/SideBySideVideos';
import { SmoothRender } from '@/base/components/SmoothRender';
import { Venn } from '@/base/components/Venn';

const components = {
  Admonition,
  Danger,
  Image: ArticleImage,
  Info,
  Note,
  PostAndDate,
  SideBySideImages,
  Tip,
  TweetEmbed,
  SmoothRender,
  SideBySideVideos,
  Warning,
  InlineMath: SafeInlineMath,
  BlockMath: SafeBlockMath,
  Venn,
};

const rehypeShikiOptions = {
  theme: 'rose-pine-moon',
  transformers: [codeBlockMetaTransformer],
};

interface MDXServerProps {
  source: string;
}

function withSmoothRender(source: string) {
  if (source.includes('<SmoothRender')) {
    return source;
  }

  return `<SmoothRender>\n\n${source}\n\n</SmoothRender>`;
}

export async function MDXServer({ source }: MDXServerProps) {
  const { content } = await compileMDX({
    source: withSmoothRender(source),
    components,
    options: {
      mdxOptions: {
        rehypePlugins: [rehypeSlug, [rehypeShiki, rehypeShikiOptions]],
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return content;
}
