import Image from 'next/image';

import { getImageMeta } from '@/lib/image';

type ArticleImageProps = {
  src: string;
  alt?: string;
  caption?: string;
  authorName?: string;
  authorHref?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/**
 * Imagem para o corpo do artigo. O autor informa apenas `src` (e, se quiser,
 * `alt`/`caption`/crédito); as dimensões e o blur placeholder são derivados
 * automaticamente do arquivo em `/public`, e a imagem ocupa 100% da largura da
 * coluna preservando a proporção original.
 *
 * Para imagens remotas, informe `width`/`height` (o domínio precisa estar em
 * `images.remotePatterns` no `next.config.js`); nesse caso não há blur.
 *
 * Uso no MDX:
 *
 * ```mdx
 * <Image
 *   src="/slug/foto.jpg"
 *   alt="Descrição"
 *   caption="Legenda opcional"
 *   authorName="Fulano"
 *   authorHref="https://exemplo.com"
 * />
 * ```
 */
export async function ArticleImage({
  src,
  alt = '',
  caption,
  authorName,
  authorHref,
  width: widthProp,
  height: heightProp,
  priority = false,
}: Readonly<ArticleImageProps>) {
  const meta = await getImageMeta(src);
  const width = widthProp ?? meta.width;
  const height = heightProp ?? meta.height;

  return (
    <figure className="article-image">
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        priority={priority}
        placeholder={meta.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={meta.blurDataURL}
        sizes="(max-width: 768px) 100vw, 672px"
        className="rounded-md border border-site-border-subtle"
        style={{ width: '100%', height: 'auto' }}
      />
      {caption || authorName ? (
        <figcaption>
          {caption ? (
            <span className="article-image-caption">{caption}</span>
          ) : null}
          {authorName ? (
            <span className="article-image-credit">
              Foto por{' '}
              {authorHref ? (
                <a href={authorHref} target="_blank" rel="noreferrer">
                  {authorName}
                </a>
              ) : (
                authorName
              )}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
