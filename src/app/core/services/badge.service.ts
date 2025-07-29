import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
export enum BadgeStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
  AVAILABLE_FROM = "AVAILABLE_FROM",
}

export type LegacyBadgeStatus = "available" | "unavailable" | "availableFrom";

export interface Badge {
  id: string;
  status: BadgeStatus;
  availableFrom: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBadgeDto {
  status?: BadgeStatus;
  availableFrom?: string;
}

export interface UpdateBadgeDto {
  status?: BadgeStatus;
  availableFrom?: string;
}

export interface HomeBadgeData {
  status: LegacyBadgeStatus;
  availableFromDate: Date | null;
}

@Injectable({
  providedIn: "root",
})
export class BadgeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/badges`;

  private readonly _badgeState = signal<HomeBadgeData>({
    status: "availableFrom",
    availableFromDate: new Date("2025-08-25"),
  });

  readonly badgeState = this._badgeState.asReadonly();

  readonly status = computed(() => this._badgeState().status);
  readonly availableFromDate = computed(
    () => this._badgeState().availableFromDate,
  );

  readonly statusText = computed(() => {
    switch (this.status()) {
      case "available":
        return "Disponible";
      case "unavailable":
        return "Indisponible";
      case "availableFrom":
        return "Disponible à partir du :";
      default:
        return "Statut inconnu";
    }
  });

  constructor() {
    this.loadFromStorage();
    this.loadLatestBadge();
  }

  public findAll(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl);
  }
  public findOne(id: string): Observable<Badge> {
    return this.http.get<Badge>(`${this.apiUrl}/${id}`);
  }
  public create(createBadgeDto: CreateBadgeDto): Observable<Badge> {
    return this.http.post<Badge>(this.apiUrl, createBadgeDto);
  }
  public update(id: string, updateBadgeDto: UpdateBadgeDto): Observable<Badge> {
    return this.http.patch<Badge>(`${this.apiUrl}/${id}`, updateBadgeDto);
  }
  public remove(id: string): Observable<Badge> {
    return this.http.delete<Badge>(`${this.apiUrl}/${id}`);
  }
  updateStatus(status: LegacyBadgeStatus): void {
    this._badgeState.update((current) => ({
      ...current,
      status,
    }));
    this.saveToStorage();

    const apiStatus = this.mapLegacyStatusToApi(status);

    const badgeId =
      localStorage.getItem("currentBadgeId") ?? "default-badge-id";

    this.update(badgeId, { status: apiStatus }).subscribe({
      next: (badge) => {
        localStorage.setItem("currentBadgeId", badge.id);
      },
      error: (error) => console.error("Error updating badge status:", error),
    });
  }
  updateDate(date: Date | null): void {
    // Ensure date is a valid Date object if it exists
    let validDate: Date | null = null;

    if (date) {
      if (!isNaN(date.getTime())) {
        validDate = date;
      } else {
        try {
          const tempDate = new Date(date);
          if (!isNaN(tempDate.getTime())) {
            validDate = tempDate;
          }
        } catch (error) {
          console.error("Invalid date format:", error);
        }
      }
    }

    this._badgeState.update((current) => ({
      ...current,
      availableFromDate: validDate,
    }));
    this.saveToStorage();

    if (validDate) {
      const badgeId =
        localStorage.getItem("currentBadgeId") ?? "default-badge-id";

      this.update(badgeId, {
        availableFrom: validDate.toISOString(),
      }).subscribe({
        next: (badge) => {
          localStorage.setItem("currentBadgeId", badge.id);
        },
        error: (error) => console.error("Error updating badge date:", error),
      });
    }
  }

  updateBadge(badgeData: HomeBadgeData): void {
    // Ensure availableFromDate is a proper Date object if it exists
    const processedBadgeData = {
      ...badgeData,
      availableFromDate: badgeData.availableFromDate ?? null,
    };

    this._badgeState.set(processedBadgeData);
    this.saveToStorage();

    const apiStatus = this.mapLegacyStatusToApi(processedBadgeData.status);
    const availableFromDate = processedBadgeData.availableFromDate;
    const isValidDate =
      availableFromDate instanceof Date && !isNaN(availableFromDate?.getTime());

    const updateDto: UpdateBadgeDto = {
      status: apiStatus,
      availableFrom: isValidDate ? availableFromDate.toISOString() : undefined,
    };

    const badgeId =
      localStorage.getItem("currentBadgeId") ?? "default-badge-id";

    // Update on API
    this.update(badgeId, updateDto).subscribe({
      next: (badge) => {
        localStorage.setItem("currentBadgeId", badge.id);
      },
      error: (error) => console.error("Error updating badge:", error),
    });
  }
  createBadge(): Observable<Badge> {
    const availableFromDate = this._badgeState().availableFromDate;
    const isValidDate =
      availableFromDate instanceof Date && !isNaN(availableFromDate?.getTime());

    const createDto: CreateBadgeDto = {
      status: this.mapLegacyStatusToApi(this._badgeState().status),
      availableFrom: isValidDate ? availableFromDate.toISOString() : undefined,
    };

    return this.create(createDto);
  }
  private mapLegacyStatusToApi(status: LegacyBadgeStatus): BadgeStatus {
    switch (status) {
      case "available":
        return BadgeStatus.AVAILABLE;
      case "unavailable":
        return BadgeStatus.UNAVAILABLE;
      case "availableFrom":
        return BadgeStatus.AVAILABLE_FROM;
      default:
        return BadgeStatus.AVAILABLE;
    }
  }
  private mapApiStatusToLegacy(status: BadgeStatus): LegacyBadgeStatus {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return "available";
      case BadgeStatus.UNAVAILABLE:
        return "unavailable";
      case BadgeStatus.AVAILABLE_FROM:
        return "availableFrom";
      default:
        return "available";
    }
  }
  private loadLatestBadge(): void {
    this.findAll().subscribe({
      next: (badges) => {
        if (badges && badges.length > 0) {
          const latestBadge = badges.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0];

          localStorage.setItem("currentBadgeId", latestBadge.id);

          this._badgeState.set({
            status: this.mapApiStatusToLegacy(latestBadge.status),
            availableFromDate: latestBadge.availableFrom
              ? new Date(latestBadge.availableFrom)
              : null,
          });

          this.saveToStorage();
        }
      },
      error: (error) => console.error("Error loading badges from API:", error),
    });
  }

  private saveToStorage(): void {
    try {
      const availableFromDate = this._badgeState().availableFromDate;
      const isValidDate =
        availableFromDate instanceof Date &&
        !isNaN(availableFromDate.getTime());

      const data = {
        ...this._badgeState(),
        availableFromDate: isValidDate
          ? availableFromDate.toISOString()
          : undefined,
      };
      localStorage.setItem("homeBadgeData", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving badge data to localStorage:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem("homeBadgeData");
      if (storedData) {
        const data = JSON.parse(storedData);
        this._badgeState.set({
          status: data.status,
          availableFromDate: data.availableFromDate
            ? new Date(data.availableFromDate)
            : null,
        });
      }
    } catch (error) {
      console.error("Error loading badge data from localStorage:", error);
    }
  }
}
