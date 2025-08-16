import { Injectable, inject } from "@angular/core";
import { SupabaseService } from "@core/services/supabase-service";

export interface AdminAction {
  user_id: string;
  action: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  old_data?: unknown;
  new_data?: unknown;
  ip_address?: string;
  user_agent?: string;
}

@Injectable({ providedIn: "root" })
export class AuditService {
  private readonly supabase = inject(SupabaseService);

  async logAdminAction(action: Omit<AdminAction, "user_id">): Promise<void> {
    const user = this.supabase.user();
    if (!user || !this.supabase.isAdmin()) {
      return; // Pas d'audit si pas admin
    }

    try {
      const auditEntry: AdminAction = {
        ...action,
        user_id: user.id,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      };

      await this.supabase.from("admin_audit_log").insert(auditEntry);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'audit:", error);
    }
  }

  async getAuditLogs(limit = 50, offset = 0) {
    if (!this.supabase.isAdmin()) {
      throw new Error("Accès non autorisé aux logs d'audit");
    }

    return this.supabase
      .from("admin_audit_log")
      .select(
        `
        *,
        profiles(username)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  }

  private async getClientIP(): Promise<string> {
    try {
      // En développement, retourne une IP factice
      if (location.hostname === "localhost") {
        return "127.0.0.1";
      }

      // En production, vous pourriez utiliser un service comme ipapi
      // const response = await fetch('https://ipapi.co/ip/');
      // return await response.text();

      return "unknown";
    } catch {
      return "unknown";
    }
  }

  async logCreate(
    table: string,
    recordId: string,
    data: unknown,
  ): Promise<void> {
    await this.logAdminAction({
      action: "create",
      table_name: table,
      record_id: recordId,
      new_data: data,
    });
  }

  async logUpdate(
    table: string,
    recordId: string,
    oldData: unknown,
    newData: unknown,
  ): Promise<void> {
    await this.logAdminAction({
      action: "update",
      table_name: table,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
    });
  }

  async logDelete(
    table: string,
    recordId: string,
    data: unknown,
  ): Promise<void> {
    await this.logAdminAction({
      action: "delete",
      table_name: table,
      record_id: recordId,
      old_data: data,
    });
  }
}
