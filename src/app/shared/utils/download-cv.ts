import { inject } from "@angular/core";
import { CvService, CvData } from "@features/cv/services/cv-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import { openInNewTab } from "@shared/utils/open-in-new-tab";

export async function downloadCvFlow(
  depsOrOptions?: { cvService: CvService; toastService: ToastService } | { onFinally?: () => void },
  maybeOptions?: { onFinally?: () => void }
): Promise<boolean | null> {

  type Deps = { cvService: CvService; toastService: ToastService };
  const isDeps = (v: unknown): v is Deps =>
    !!v && typeof v === "object" && "cvService" in (v as Record<string, unknown>) && "toastService" in (v as Record<string, unknown>);
  const hasDeps = isDeps(depsOrOptions);
  const options = (hasDeps ? maybeOptions : (depsOrOptions as { onFinally?: () => void } | undefined)) ?? {};

  const cvService = hasDeps ? (depsOrOptions as { cvService: CvService }).cvService : inject(CvService);
  const toastService = hasDeps ? (depsOrOptions as { toastService: ToastService }).toastService : inject(ToastService);

  try {
    const publicUrl = await cvService.downloadCV();
    if (!publicUrl) {
      toastService.show({
        message:
          "Échec de l'ouverture du CV. Le fichier n'existe peut-être pas ou vous n'avez pas les permissions.",
        type: "error",
      });
      return null;
    }

    cvService
      .incrementDownloadCount()
      .catch((error) => console.warn("Could not increment download count:", error));

    const meta = cvService.cvData();
    const filename = deriveCvFilename(meta);

    const separator = publicUrl.includes("?") ? "&" : "?";
    const urlWithFilename = `${publicUrl}${separator}filename=${encodeURIComponent(filename)}`;

    const ok = openInNewTab(urlWithFilename);
    if (!ok) {
      toastService.show({
        message: "L'ouverture a été bloquée. Cliquez sur ce lien: " + publicUrl,
        type: "warning",
        duration: 6000,
      });
    } else {
      toastService.show({
        message: "Ouverture du CV dans un nouvel onglet.",
        type: "success",
      });
    }
    return ok;
  } finally {
    options.onFinally?.();
  }
}

export function deriveCvFilename(meta: CvData | null): string {
  const fallback = "CV.pdf";
  if (!meta) return fallback;

  const orig = (meta.originalName ?? "").trim();
  if (orig.length > 0) return orig;

  const fileName = (meta.fileName ?? "").trim();
  if (fileName.length > 0) return fileName;

  const fromPath = (meta.filePath ?? "").split("/").pop();
  return (fromPath && fromPath.trim().length > 0 ? fromPath.trim() : undefined) ?? fallback;
}
