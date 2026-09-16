// Bodoni Moda é serifada, com ascendentes/descendentes altos. O CSS dos handoffs usa
// line-height 1 / .95 (funciona no navegador, que centraliza a caixa da linha com folga),
// mas no React Native lineHeight define uma caixa fixa — abaixo de ~1.2x o fontSize, as
// letras cortam de verdade (mais visível em maiúsculas e acentos). Usar esse fator em
// qualquer título Bodoni evita ter que redescobrir isso tela por tela.
export const BODONI_LINE_HEIGHT_RATIO = 1.25;

export function bodoniLineHeight(fontSize: number) {
  return fontSize * BODONI_LINE_HEIGHT_RATIO;
}
