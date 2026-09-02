// Fonte única de verdade para seções do site que podem ser ligadas/desligadas.
// Uma seção desativada aqui aparece no menu como "em breve" (Navbar), bloqueia
// o acesso direto à sua rota (notFound) e some do sitemap. Alternar uma seção
// é editar o valor abaixo — nenhum outro arquivo deve guardar esse estado.
export const SECTION_FLAGS = {
  contact: false,
  uses: false,
} as const satisfies Record<string, boolean>;

export type SectionKey = keyof typeof SECTION_FLAGS;
