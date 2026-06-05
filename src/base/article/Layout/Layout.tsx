import { FC, PropsWithChildren } from 'react';

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
        <div className="flex w-full flex-col gap-12 py-12">
          <div className="flex w-full gap-12 pt-12 md:pb-12">
            <main className="flex w-full min-w-0 max-w-2xl flex-1 flex-col gap-12">
              <article
                className="post"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                <header className="mb-10">
                  <div className="flex items-start gap-4">
                    {icon ? (
                      <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-site-border bg-site-primary-soft text-2xl leading-none text-site-primary">
                        {icon}
                      </span>
                    ) : null}
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
