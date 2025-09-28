import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, MessageRole } from '@smart-assistant/shared/types';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-list" #messageList>
      <div class="messages-container">
        <div 
          *ngFor="let message of messages; trackBy: trackByMessageId"
          class="message-wrapper"
          [class.user-message]="message.role === MessageRole.USER"
          [class.assistant-message]="message.role === MessageRole.ASSISTANT"
          [class.system-message]="message.role === MessageRole.SYSTEM"
        >
          <div class="message-bubble">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
        
        <div *ngIf="isLoading" class="message-wrapper assistant-message">
          <div class="message-bubble loading">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background: #f8f9fa;
    }

    .messages-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-wrapper {
      display: flex;
      align-items: flex-start;
    }

    .message-wrapper.user-message {
      justify-content: flex-end;
    }

    .message-wrapper.assistant-message {
      justify-content: flex-start;
    }

    .message-wrapper.system-message {
      justify-content: center;
    }

    .message-bubble {
      max-width: 70%;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      position: relative;
      word-wrap: break-word;
    }

    .user-message .message-bubble {
      background: #007bff;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }

    .assistant-message .message-bubble {
      background: white;
      color: #212529;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 0.25rem;
    }

    .system-message .message-bubble {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
      font-style: italic;
      text-align: center;
      max-width: 50%;
    }

    .message-content {
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 0.25rem;
      white-space: pre-wrap;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      text-align: right;
    }

    .user-message .message-time {
      color: rgba(255, 255, 255, 0.8);
    }

    .assistant-message .message-time {
      color: #6c757d;
    }

    .loading {
      padding: 1rem !important;
    }

    .typing-indicator {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      justify-content: center;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Scrollbar styling */
    .message-list::-webkit-scrollbar {
      width: 6px;
    }

    .message-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .message-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .message-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class MessageListComponent implements OnChanges, AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() isLoading = false;
  
  @ViewChild('messageList') messageList!: ElementRef<HTMLDivElement>;
  
  readonly MessageRole = MessageRole;
  private shouldScrollToBottom = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && changes['messages'].currentValue) {
      this.shouldScrollToBottom = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom(): void {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}