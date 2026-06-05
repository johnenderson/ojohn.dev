const urlToPosition = {
  '/a-mental-model-to-think-in-typescript': { x: 1500, y: 700 },
  '/basic-recipes-for-react-testing-library': { x: 1400, y: 700 },
  '/building-an-abstraction-for-react-internationalization-messages': {
    x: 1398,
    y: 360,
  },
  '/closure-currying-and-cool-abstractions': { x: 1400, y: 1000 },
  '/consistent-state-management-in-react-and-redux': { x: 1200, y: 500 },
  '/constant-feedback-driven-development-with-nodemon': { x: 900, y: 700 },
  '/data-fetching-in-react-with-react-query': { x: 1200, y: 600 },
  '/designing-my-lifes-system': { x: 800, y: 700 },
  '/dx-and-software-maintainability-in-frontend-engineering': {
    x: 1300,
    y: 700,
  },
  '/fun-with-dates': { x: 1000, y: 1000 },
  '/how-i-received-4-salary-raises-in-2-years-of-quintoandar-as-a-software-engineer':
    { x: 1200, y: 700 },
  '/publisher-a-tooling-to-automate-the-process-to-publish-my-blog-posts': {
    x: 1000,
    y: 700,
  },
  '/react-hooks-context-api-and-pokemons': { x: 1924, y: 724 },
  '/react-query-complex-dependent-queries': { x: 1200, y: 700 },
  '/tdd-functions-and-react-components': { x: 1200, y: 700 },
  '/thinking-in-data-contracts': { x: 1772, y: 508 },
  '/ux-studies-with-react-typescript-and-testing-library': { x: 1400, y: 700 },
  '/series/frontend-challenges': { x: 1200, y: 500 },
  '/series/typescript-learnings/interesting-types': { x: 1200, y: 900 },
  '/series/typescript-learnings/object-destructuring': { x: 1200, y: 1000 },
  '/series/typescript-learnings/type-system': { x: 1200, y: 1100 },
  '/series/typescript-learnings/union-types-with-objects': { x: 1300, y: 1000 },
  '/series/website-changelog/building-my-legacy-through-accessible-open-and-free-content':
    { x: 2000, y: 700 },
};

type Position = {
  x: number;
  y: number;
};

type UrlToPosition = {
  [key: string]: Position | undefined;
};

export function getNodePosition(url: string) {
  return (
    (urlToPosition as UrlToPosition)[url] || {
      x: 0,
      y: 0,
    }
  );
}
