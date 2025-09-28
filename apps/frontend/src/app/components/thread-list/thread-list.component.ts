import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Thread } from '@smart-assistant/shared/types';

@Component({
  selector: 'app-thread-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="thread-list">
      <div class="thread-list-header">
        <button 
          class="new-thread-btn"
          (click)="onNewThread()"
        >
          <span class="icon">+</span>
          Start new thread
        </button>
      </div>
      
      <div class="threads" *ngIf="threads.length > 0">
        <div class="threads-header">Recent Threads</div>
        <div 
          *ngFor="let thread of threads; trackBy: trackByThreadId"
          class="thread-item"
          [class.active]="thread.id === selectedThreadId"
          (click)="onThreadSelect(thread)"
        >
          <div class="thread-title">{{ thread.title }}</div>
          <div class="thread-date">{{ formatDate(thread.updatedAt) }}</div>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="threads.length === 0">
        <p>No threads yet. Start a new conversation!</p>
      </div>
    </div>
  `,
  styles: [`
    .thread-list {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: #f8f9fa;
      border-right: 1px solid #e9ecef;
    }

    .thread-list-header {
      margin-bottom: 1.5rem;
    }

    .new-thread-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.2s;
    }

    .new-thread-btn:hover {
      background: #0056b3;
    }

    .new-thread-btn .icon {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .threads-header {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #6c757d;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }

    .thread-item {
      padding: 0.75rem;
      margin-bottom: 0.25rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s;
      border: 1px solid transparent;
    }

    .thread-item:hover {
      background: #e9ecef;
    }

    .thread-item.active {
      background: #007bff;
      color: white;
      border-color: #0056b3;
    }

    .thread-title {
      font-weight: 500;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .thread-date {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #6c757d;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }
  `]
})
export class ThreadListComponent {
  @Input() threads: Thread[] = [];
  @Input() selectedThreadId: string | null = null;
  
  @Output() threadSelect = new EventEmitter<Thread>();
  @Output() newThread = new EventEmitter<void>();

  onThreadSelect(thread: Thread): void {
    this.threadSelect.emit(thread);
  }

  onNewThread(): void {
    this.newThread.emit();
  }

  trackByThreadId(index: number, thread: Thread): string {
    return thread.id;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }
}