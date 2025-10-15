// Utilitaire pour rendre les IDs de gradients SVG uniques
export function makeSvgGradientsUnique(svg: string, uniqueId: string): string {
  return svg
    .replace(/id="(SVG\w+)"/g, `id="$1-${uniqueId}"`)
    .replace(/url\(#(SVG\w+)\)/g, `url(#$1-${uniqueId})`);
}
