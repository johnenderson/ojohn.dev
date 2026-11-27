import type { CSSProperties } from 'react';

const HERO_NAME = 'John Enderson';
const CHAR_DELAY_MS = 35;
const FIRST_DELAY_MS = 100;

const delayStyle = (position: number) =>
  ({
    '--hero-char-delay': `${FIRST_DELAY_MS + position * CHAR_DELAY_MS}ms`,
  } as CSSProperties);

/**
 * Nome animado letra a letra. A marcação é a mesma no servidor e no navegador:
 * quem decide se anima é o CSS (`.hero-char`), conforme a preferência de
 * movimento. Escolher a marcação em JS quebrava a hidratação.
 */
const SplitName = () => {
  const words = HERO_NAME.split(' ');

  return (
    <span aria-hidden="true" className="inline-flex flex-wrap gap-x-[0.28em]">
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="inline-flex overflow-hidden"
        >
          {Array.from(word).map((char, charIndex) => (
            <span
              key={`${char}-${charIndex}`}
              className="hero-char inline-block"
              style={delayStyle(wordIndex * 5 + charIndex)}
            >
              {char}
            </span>
          ))}
          {wordIndex === words.length - 1 && (
            <span
              className="hero-char inline-block text-site-primary"
              style={delayStyle(HERO_NAME.length)}
            >
              .
            </span>
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
