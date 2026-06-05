import type { ShikiTransformer } from '@shikijs/types';

const getTitleFromMeta = (meta: string | undefined) => {
  if (!meta) return null;

  const match = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/.exec(meta);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
};

/**
 * Expõe o título (a partir do meta do fence, ex.: ```ts title="file.ts") e a
 * linguagem do bloco de código como data attributes no elemento <pre> gerado.
 *
 * Precisa rodar como transformer do Shiki (e não como um rehype plugin
 * independente que executa antes do rehypeShiki), porque o Shiki substitui
 * completamente os nós <pre>/<code> originais — descartando quaisquer
 * atributos definidos previamente.
 */
export const codeBlockMetaTransformer: ShikiTransformer = {
  name: 'code-block-meta',
  pre(node) {
    const title = getTitleFromMeta(this.options.meta?.__raw);
    const language = this.options.lang;

    node.properties = {
      ...node.properties,
      ...(title ? { 'data-code-title': title } : {}),
      ...(language && language !== 'text' && language !== 'plaintext'
        ? { 'data-code-language': language }
        : {}),
    };
  },
};
