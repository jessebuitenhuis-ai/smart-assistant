import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="message-input-container">
      <div class="input-wrapper">
        <textarea
          #messageTextarea
          [(ngModel)]="message"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (keydown)="onKeyDown($event)"
          (input)="onInput()"
          class="message-textarea"
          rows="1"
        ></textarea>
        <button
          type="button"
          class="send-button"
          [disabled]="!canSend"
          (click)="onSend()"
        >
          <span class="send-icon">→</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .message-input-container {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .message-textarea {
      flex: 1;
      min-height: 44px;
      max-height: 200px;
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 1.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
      resize: none;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .message-textarea:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .message-textarea:disabled {
      background-color: #f8f9fa;
      opacity: 0.6;
      cursor: not-allowed;
    }

    .send-button {
      width: 44px;
      height: 44px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, transform 0.1s;
      flex-shrink: 0;
    }

    .send-button:hover:not(:disabled) {
      background: #0056b3;
      transform: scale(1.05);
    }

    .send-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .send-icon {
      font-size: 1.25rem;
      font-weight: bold;
      transform: rotate(-45deg);
    }
  `]
})
export class MessageInputComponent implements AfterViewInit {
  @Input() placeholder = 'Type a message...';
  @Input() disabled = false;
  
  @Output() messageSend = new EventEmitter<string>();
  
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  
  message = '';

  get canSend(): boolean {
    return this.message.trim().length > 0 && !this.disabled;
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.canSend) {
        this.onSend();
      }
    }
  }

  onInput(): void {
    this.adjustTextareaHeight();
  }

  onSend(): void {
    if (this.canSend) {
      const messageContent = this.message.trim();
      this.message = '';
      this.adjustTextareaHeight();
      this.messageSend.emit(messageContent);
    }
  }

  focusInput(): void {
    if (this.messageTextarea) {
      this.messageTextarea.nativeElement.focus();
    }
  }

  private adjustTextareaHeight(): void {
    const textarea = this.messageTextarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }
}