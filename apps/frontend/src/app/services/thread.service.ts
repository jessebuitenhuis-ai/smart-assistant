import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Thread, ThreadWithMessages, CreateThreadRequest } from '@smart-assistant/shared/types';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private readonly baseUrl = '/api/threads';
  private threadsSubject = new BehaviorSubject<Thread[]>([]);
  private currentThreadSubject = new BehaviorSubject<ThreadWithMessages | null>(null);

  public threads$ = this.threadsSubject.asObservable();
  public currentThread$ = this.currentThreadSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load all threads for the current user
   */
  loadThreads(userId: string): Observable<Thread[]> {
    return this.http.get<Thread[]>(`${this.baseUrl}?userId=${userId}`)
      .pipe(
        tap(threads => this.threadsSubject.next(threads))
      );
  }

  /**
   * Get a specific thread with its messages
   */
  getThread(threadId: string): Observable<ThreadWithMessages> {
    return this.http.get<ThreadWithMessages>(`${this.baseUrl}/${threadId}`)
      .pipe(
        tap(thread => this.currentThreadSubject.next(thread))
      );
  }

  /**
   * Create a new thread
   */
  createThread(request: CreateThreadRequest): Observable<Thread> {
    return this.http.post<Thread>(this.baseUrl, request)
      .pipe(
        tap(newThread => {
          const currentThreads = this.threadsSubject.value;
          this.threadsSubject.next([newThread, ...currentThreads]);
        })
      );
  }

  /**
   * Update thread title
   */
  updateThread(threadId: string, title: string): Observable<Thread> {
    return this.http.patch<Thread>(`${this.baseUrl}/${threadId}`, { title })
      .pipe(
        tap(updatedThread => {
          const currentThreads = this.threadsSubject.value;
          const index = currentThreads.findIndex(t => t.id === threadId);
          if (index !== -1) {
            currentThreads[index] = updatedThread;
            this.threadsSubject.next([...currentThreads]);
          }
        })
      );
  }

  /**
   * Delete a thread
   */
  deleteThread(threadId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${threadId}`)
      .pipe(
        tap(() => {
          const currentThreads = this.threadsSubject.value;
          this.threadsSubject.next(currentThreads.filter(t => t.id !== threadId));
          
          // Clear current thread if it was deleted
          const currentThread = this.currentThreadSubject.value;
          if (currentThread?.id === threadId) {
            this.currentThreadSubject.next(null);
          }
        })
      );
  }

  /**
   * Set the current active thread
   */
  setCurrentThread(thread: ThreadWithMessages | null): void {
    this.currentThreadSubject.next(thread);
  }

  /**
   * Get the current threads without subscribing
   */
  getCurrentThreads(): Thread[] {
    return this.threadsSubject.value;
  }

  /**
   * Get the current active thread without subscribing
   */
  getCurrentThread(): ThreadWithMessages | null {
    return this.currentThreadSubject.value;
  }
}