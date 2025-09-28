import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">💬</div>
        <h2 class="empty-title">Start a conversation</h2>
        <p class="empty-description">
          Ask me anything or start a new thread to begin our conversation.
        </p>
        <button 
          class="start-button"
          (click)="onStartConversation()"
        >
          Start new thread
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f8f9fa;
    }

    .empty-content {
      text-align: center;
      max-width: 400px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #212529;
      margin: 0 0 0.75rem 0;
    }

    .empty-description {
      font-size: 1rem;
      color: #6c757d;
      line-height: 1.5;
      margin: 0 0 2rem 0;
    }

    .start-button {
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    .start-button:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .start-button:active {
      transform: translateY(0);
    }
  `]
})
export class EmptyStateComponent {
  @Output() startConversation = new EventEmitter<void>();

  onStartConversation(): void {
    this.startConversation.emit();
  }
}