import { FC, PropsWithChildren } from 'react';

import { ArticleIcon } from '@/base/article/ArticleIcon/ArticleIcon';
import { ArticleNavigation } from '@/base/article/ArticleNavigation';
import { CodeCopyButtons } from '@/base/article/CodeCopyButtons';
import { CoverImage } from '@/base/article/CoverImage';
import { HeadingAnchors } from '@/base/article/HeadingAnchors';
import { Footer } from '@/base/article/Layout/Footer';
import { Meta } from '@/base/article/Meta';
import { ReadingProgress } from '@/base/article/ReadingProgress';
import { TableOfContents } from '@/base/article/TableOfContents/TableOfContents';
import { Title } from '@/base/article/Title';
import { AnimationLayout } from '@/base/components/Layout/AnimationLayout';
import { Navbar } from '@/base/components/Navbar';
import {
  ArticleAlternative,
  ArticleCoverImage,
  ArticleNavigation as ArticleNavigationType,
} from '@/features/articles/lib/articles';

type LayoutPropTypes = {
  title: string;
  date: string;
  icon?: string;
  alternativeArticle?: ArticleAlternative;
  coverImage?: ArticleCoverImage;
  minutes: number;
  navigation: ArticleNavigationType;
  tags: string[];
};

export const Layout: FC<PropsWithChildren<LayoutPropTypes>> = ({
  children,
  title,
  date,
  icon,
  coverImage,
  alternativeArticle,
  minutes,
  navigation,
  tags,
}) => (
  <>
    <ReadingProgress />
    <Navbar />
    <AnimationLayout>
      <div className="content article-content">
        <div className="flex w-full flex-col py-8 md:py-10">
          <div className="flex w-full items-start justify-between gap-8 pt-8 md:pb-4 xl:gap-10">
            <main
              id="main"
              className="flex w-full min-w-0 max-w-[44rem] flex-1 flex-col gap-12"
            >
              <article
                className="post"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                <header className="mb-12 border-b border-site-border-subtle pb-8">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {icon ? <ArticleIcon icon={icon} size="lg" /> : null}
                    <div className="flex min-w-0 flex-col gap-3">
                      <Title text={title} />
                      <Meta
                        date={date}
                        alternativeArticle={alternativeArticle}
                        minutes={minutes}
                        tags={tags}
                      />
                    </div>
                  </div>
                </header>
                <TableOfContents variant="mobile" />

                {coverImage?.src && (
                  <CoverImage
                    src={coverImage.src}
                    width={coverImage.width}
                    height={coverImage.height}
                    alt={coverImage.alt}
                    authorHref={coverImage.authorHref}
                    authorName={coverImage.authorName}
                    blurDataURL={coverImage.blurDataURL}
                  />
                )}

                {children}
                <CodeCopyButtons />
                <HeadingAnchors />
                <ArticleNavigation navigation={navigation} />
              </article>

              <Footer />
            </main>

            <TableOfContents variant="desktop" />
          </div>
        </div>
      </div>
    </AnimationLayout>
  </>
);
