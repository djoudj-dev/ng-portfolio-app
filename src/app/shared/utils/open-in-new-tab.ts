/**
 * Open a URL in a new browser tab in a robust and popup-blocker-friendly way.
 * Returns true if the browser accepted the open request, false otherwise.
 */
export function openInNewTab(url: string): boolean {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    const w = window.open(url, '_blank');
    return !!w;
  }
}
