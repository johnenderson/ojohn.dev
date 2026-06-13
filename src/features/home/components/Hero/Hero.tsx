'use client';

import { motion, useReducedMotion } from 'motion/react';

const HERO_NAME = 'John Enderson';

const SplitName = () => {
  const shouldReduceMotion = useReducedMotion();
  const words = HERO_NAME.split(' ');

  if (shouldReduceMotion) {
    return (
      <>
        {HERO_NAME}
        <span className="text-site-primary">.</span>
      </>
    );
  }

  return (
    <span aria-hidden="true" className="inline-flex flex-wrap gap-x-[0.28em]">
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="inline-flex overflow-hidden"
        >
          {Array.from(word).map((char, charIndex) => (
            <motion.span
              key={`${char}-${charIndex}`}
              className="inline-block"
              initial={{ opacity: 0, y: '0.72em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + (wordIndex * 5 + charIndex) * 0.035,
                duration: 0.62,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex === words.length - 1 && (
            <motion.span
              className="inline-block text-site-primary"
              initial={{ opacity: 0, y: '0.72em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + HERO_NAME.length * 0.035,
                duration: 0.62,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              .
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
};

export const Hero = () => (
  <section className="site-fade-in pt-8 md:pt-14">
    <h1
      aria-label={HERO_NAME}
      className="m-0 max-w-3xl text-4xl font-black leading-[1.05] tracking-normal text-site-foreground sm:text-5xl"
    >
      <SplitName />
    </h1>
  </section>
);
