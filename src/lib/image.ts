import path from 'node:path';
import sharp from 'sharp';

const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 675;

export type ImageMeta = {
  width: number;
  height: number;
  blurDataURL?: string;
};

const isLocalSrc = (src: string) =>
  src.startsWith('/') && !src.startsWith('//');

/**
 * Lê uma imagem de `/public` e retorna suas dimensões + um blur placeholder
 * (base64) gerado com `sharp`. Para `src` remoto ou em caso de falha (arquivo
 * ausente/corrompido), retorna apenas dimensões de fallback, sem blur.
 */
export async function getImageMeta(src: string): Promise<ImageMeta> {
  if (!isLocalSrc(src)) {
    return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  }

  try {
    const imagePath = path.join(process.cwd(), 'public', src);

    const metadata = await sharp(imagePath).metadata();
    const blurBuffer = await sharp(imagePath)
      .resize(20, null, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer();

    return {
      width: metadata.width ?? FALLBACK_WIDTH,
      height: metadata.height ?? FALLBACK_HEIGHT,
      blurDataURL: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
    };
  } catch {
    return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  }
}
