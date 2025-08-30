import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, BehaviorSubject, throwError, combineLatest } from 'rxjs';
import { map, catchError, tap, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '@shared/ui/toast/service/toast-service';
import { environment } from '@environments/environment';
import {
  Badge,
  BadgeStatus,
  BadgeResponse,
  UpdateBadgeRequest,
  BadgeFilters,
  BadgeState,
  badgeFromResponse,
  badgeToRequest,
  BADGE_STATUS,
} from '@features/badge/models/badge-model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // State management avec signals
  private readonly _state = signal<BadgeState>({
    badges: [],
    loading: false,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });

  // BehaviorSubjects pour les filtres réactifs
  private readonly filtersSubject = new BehaviorSubject<BadgeFilters>({});
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  // Public readonly state
  public readonly state = this._state.asReadonly();

  // Computed values
  public readonly badges = computed(() => this._state().badges);
  public readonly loading = computed(() => this._state().loading);
  public readonly error = computed(() => this._state().error);
  public readonly filters = computed(() => this._state().filters);
  public readonly pagination = computed(() => this._state().pagination);

  // Derived computed values
  public readonly availableBadges = computed(() =>
    this.badges().filter(badge => badge.status === BADGE_STATUS.AVAILABLE)
  );

  public readonly unavailableBadges = computed(() =>
    this.badges().filter(badge => badge.status === BADGE_STATUS.UNAVAILABLE)
  );

  public readonly upcomingBadges = computed(() =>
    this.badges().filter(badge => badge.status === BADGE_STATUS.AVAILABLE_FROM)
  );

  public readonly latestBadge = computed(() => {
    const badges = this.badges();
    if (!badges.length) return null;
    return badges.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  });

  public readonly badgeStats = computed(() => {
    const badges = this.badges();
    return {
      total: badges.length,
      available: badges.filter(b => b.status === BADGE_STATUS.AVAILABLE).length,
      unavailable: badges.filter(b => b.status === BADGE_STATUS.UNAVAILABLE).length,
      upcoming: badges.filter(b => b.status === BADGE_STATUS.AVAILABLE_FROM).length,
    };
  });

  constructor() {
    this.setupReactiveFiltering();
    this.loadBadges(); // Initial load
  }

  // Setup reactive filtering
  private setupReactiveFiltering(): void {
    combineLatest([
      this.filtersSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.refreshSubject,
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([filters]) => {
        this.updateFilters(filters);
        this.loadBadges();
      });
  }

  // API Methods - GET /badges
  loadBadges(page = 1, limit = 10): void {
    this.setLoading(true);
    this.clearError();

    const params = this.buildHttpParams(page, limit);

    this.http
      .get<BadgeResponse[]>(`${environment.apiUrl}/badges`, { params })
      .pipe(
        map(responses => responses.map(badgeFromResponse)),
        tap(badges => this.setBadges(badges)),
        catchError(error => this.handleError('Erreur lors du chargement des badges', error)),
        finalize(() => this.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // API Methods - GET /badges/:id
  getBadgeById(id: string): Observable<Badge> {
    return this.http
      .get<BadgeResponse>(`${environment.apiUrl}/badges/${id}`)
      .pipe(
        map(badgeFromResponse),
        catchError(error => this.handleError(`Badge ${id} non trouvé`, error))
      );
  }

  // API Methods - POST /badges
  createBadge(badge: Partial<Badge>): Observable<Badge> {
    this.setLoading(true);
    const request = badgeToRequest(badge);

    return this.http
      .post<BadgeResponse>(`${environment.apiUrl}/badges`, request)
      .pipe(
        map(badgeFromResponse),
        tap(newBadge => {
          this.addBadgeToState(newBadge);
          this.toastService.show({
            message: 'Badge créé avec succès',
            type: 'success',
          });
        }),
        catchError(error => this.handleError('Erreur lors de la création du badge', error)),
        finalize(() => this.setLoading(false))
      );
  }

  // API Methods - PATCH /badges/:id
  updateBadge(id: string, updates: UpdateBadgeRequest): Observable<Badge> {
    this.setLoading(true);

    return this.http
      .patch<BadgeResponse>(`${environment.apiUrl}/badges/${id}`, updates)
      .pipe(
        map(badgeFromResponse),
        tap(updatedBadge => {
          this.updateBadgeInState(updatedBadge);
          this.toastService.show({
            message: 'Badge mis à jour avec succès',
            type: 'success',
          });
        }),
        catchError(error => this.handleError('Erreur lors de la mise à jour du badge', error)),
        finalize(() => this.setLoading(false))
      );
  }

  // API Methods - DELETE /badges/:id
  deleteBadge(id: string): Observable<void> {
    this.setLoading(true);

    return this.http
      .delete<void>(`${environment.apiUrl}/badges/${id}`)
      .pipe(
        tap(() => {
          this.removeBadgeFromState(id);
          this.toastService.show({
            message: 'Badge supprimé avec succès',
            type: 'success',
          });
        }),
        catchError(error => this.handleError('Erreur lors de la suppression du badge', error)),
        finalize(() => this.setLoading(false))
      );
  }

  // Convenience methods
  updateBadgeStatus(id: string, status: BadgeStatus): Observable<Badge> {
    return this.updateBadge(id, { status });
  }

  updateBadgeAvailability(id: string, availableFrom: Date | null): Observable<Badge> {
    return this.updateBadge(id, {
      availableFrom: availableFrom?.toISOString() ?? null,
    });
  }

  // Filter methods
  setFilters(filters: BadgeFilters): void {
    this.filtersSubject.next(filters);
  }

  clearFilters(): void {
    this.filtersSubject.next({});
  }

  refresh(): void {
    this.refreshSubject.next();
  }

  // Pagination methods
  setPage(page: number): void {
    this.updatePagination({ page });
    this.loadBadges(page, this.pagination().limit);
  }

  setPageSize(limit: number): void {
    this.updatePagination({ limit, page: 1 });
    this.loadBadges(1, limit);
  }

  // Private utility methods
  private buildHttpParams(page: number, limit: number): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    const filters = this._state().filters;
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return params;
  }

  private handleError(message: string, error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message ?? error.message ?? message;

    this.setError(errorMessage);
    this.toastService.show({
      message: errorMessage,
      type: 'error',
      duration: 5000,
    });

    return throwError(() => error);
  }

  // State update methods
  private setLoading(loading: boolean): void {
    this._state.update(state => ({ ...state, loading }));
  }

  private setError(error: string | null): void {
    this._state.update(state => ({ ...state, error }));
  }

  private clearError(): void {
    this.setError(null);
  }

  private setBadges(badges: Badge[]): void {
    this._state.update(state => ({ ...state, badges }));
  }

  private addBadgeToState(badge: Badge): void {
    this._state.update(state => ({
      ...state,
      badges: [badge, ...state.badges],
    }));
  }

  private updateBadgeInState(updatedBadge: Badge): void {
    this._state.update(state => ({
      ...state,
      badges: state.badges.map(badge =>
        badge.id === updatedBadge.id ? updatedBadge : badge
      ),
    }));
  }

  private removeBadgeFromState(id: string): void {
    this._state.update(state => ({
      ...state,
      badges: state.badges.filter(badge => badge.id !== id),
    }));
  }

  private updateFilters(filters: BadgeFilters): void {
    this._state.update(state => ({ ...state, filters }));
  }

  private updatePagination(pagination: Partial<BadgeState['pagination']>): void {
    this._state.update(state => ({
      ...state,
      pagination: { ...state.pagination, ...pagination },
    }));
  }
}
