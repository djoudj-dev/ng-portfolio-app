import { Injectable, signal } from "@angular/core";
import { supabase } from "@core/services/supabase-client";
import { environment } from "@environments/environment";

@Injectable({ providedIn: "root" })
export class SupabaseStorageService {
  readonly uploadStatus = signal<"idle" | "uploading" | "done" | "error">(
    "idle",
  );

  async uploadCV(file: File, userId: string): Promise<string | null> {
    this.uploadStatus.set("uploading");

    // Use a consistent path structure without "cv/" prefix
    const path = `${userId}/${file.name}`;
    const { error } = await supabase.storage.from("docs").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      this.uploadStatus.set("error");
      return null;
    }

    // Store the file path in the cv_path database table
    const { error: dbError } = await supabase.from("cv_path").upsert(
      {
        user_id: userId,
        file_path: path,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (dbError) {
      console.error(
        "Erreur lors de l'enregistrement du chemin du CV dans la base de données:",
        dbError,
      );
    }

    this.uploadStatus.set("done");
    return path;
  }

  async downloadCV(userId: string): Promise<string | null> {
    const { data: pathData, error: pathError } = await supabase
      .from("cv_path")
      .select("file_path")
      .eq("user_id", userId)
      .single();

    if (pathError || !pathData) {
      console.error(
        "Erreur lors de la récupération du chemin du CV depuis la base de données:",
        pathError,
      );
      return null;
    }

    const path = pathData.file_path;
    return `${environment.supabaseUrl}/storage/v1/object/public/docs/${path}`;
  }
}
