import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '@smart-assistant/shared/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // For demo purposes, set a mock user
    // In a real app, this would be loaded from authentication
    this.setMockUser();
  }

  /**
   * Get the current user
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }

  /**
   * Get current user without subscribing
   */
  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set current user
   */
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * For demo purposes - set a mock user
   */
  private setMockUser(): void {
    const mockUser: User = {
      id: 'user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.currentUserSubject.next(mockUser);
  }
}