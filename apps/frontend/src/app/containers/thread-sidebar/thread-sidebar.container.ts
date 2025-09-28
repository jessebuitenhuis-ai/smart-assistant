import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThreadListComponent } from '../../components/thread-list/thread-list.component';
import { ThreadService } from '../../services/thread.service';
import { UserService } from '../../services/user.service';
import { Thread } from '@smart-assistant/shared/types';

@Component({
  selector: 'app-thread-sidebar',
  standalone: true,
  imports: [CommonModule, ThreadListComponent],
  template: `
    <app-thread-list
      [threads]="threads"
      [selectedThreadId]="selectedThreadId"
      (threadSelect)="onThreadSelect($event)"
      (newThread)="onNewThread()"
    ></app-thread-list>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 300px;
      min-width: 300px;
    }
  `]
})
export class ThreadSidebarContainer implements OnInit, OnDestroy {
  @Output() threadSelect = new EventEmitter<Thread>();
  @Output() newThread = new EventEmitter<void>();

  threads: Thread[] = [];
  selectedThreadId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private threadService: ThreadService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Subscribe to threads
    this.threadService.threads$
      .pipe(takeUntil(this.destroy$))
      .subscribe(threads => {
        this.threads = threads;
      });

    // Subscribe to current thread to update selection
    this.threadService.currentThread$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentThread => {
        this.selectedThreadId = currentThread?.id || null;
      });

    // Load threads for current user
    this.loadThreads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onThreadSelect(thread: Thread): void {
    this.threadSelect.emit(thread);
  }

  onNewThread(): void {
    this.newThread.emit();
  }

  private loadThreads(): void {
    const user = this.userService.getCurrentUserSync();
    if (user) {
      this.threadService.loadThreads(user.id).subscribe({
        error: (error) => {
          console.error('Failed to load threads:', error);
          // In a real app, show error notification
        }
      });
    }
  }
}