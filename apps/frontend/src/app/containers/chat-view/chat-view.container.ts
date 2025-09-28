import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { MessageInputComponent } from '../../components/message-input/message-input.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { ThreadService } from '../../services/thread.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { ThreadWithMessages, Message, CreateThreadRequest, MessageRole } from '@smart-assistant/shared/types';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [
    CommonModule,
    MessageListComponent,
    MessageInputComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="chat-view" [class.has-thread]="!!currentThread">
      <!-- Thread view -->
      <div *ngIf="currentThread" class="thread-view">
        <div class="thread-header">
          <h1 class="thread-title">{{ currentThread.title }}</h1>
        </div>
        
        <app-message-list
          [messages]="currentThread.messages"
          [isLoading]="isLoading"
        ></app-message-list>
        
        <app-message-input
          [disabled]="isLoading"
          (messageSend)="onMessageSend($event)"
        ></app-message-input>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!currentThread" class="empty-view">
        <app-empty-state
          (startConversation)="onStartConversation()"
        ></app-empty-state>
        
        <app-message-input
          placeholder="Type your message to start a new thread..."
          [disabled]="isLoading"
          (messageSend)="onStartWithMessage($event)"
        ></app-message-input>
      </div>
    </div>
  `,
  styles: [`
    .chat-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .thread-view,
    .empty-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .thread-header {
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e9ecef;
      flex-shrink: 0;
    }

    .thread-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-view {
      background: #f8f9fa;
    }

    .empty-view app-message-input {
      background: white;
    }
  `]
})
export class ChatViewContainer implements OnInit, OnDestroy {
  currentThread: ThreadWithMessages | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private threadService: ThreadService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Subscribe to current thread changes
    this.threadService.currentThread$
      .pipe(takeUntil(this.destroy$))
      .subscribe(thread => {
        this.currentThread = thread;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMessageSend(content: string): void {
    if (!this.currentThread) return;

    this.isLoading = true;
    
    this.messageService.sendMessage(this.currentThread.id, content)
      .subscribe({
        next: () => {
          this.isLoading = false;
          // In a real app, this would trigger an AI response
          this.simulateAIResponse();
        },
        error: (error) => {
          console.error('Failed to send message:', error);
          this.isLoading = false;
          // In a real app, show error notification
        }
      });
  }

  onStartConversation(): void {
    this.createNewThread('New Conversation');
  }

  onStartWithMessage(content: string): void {
    // Generate title from first message (first 50 chars)
    const title = content.length > 50 
      ? content.substring(0, 50) + '...' 
      : content;
    
    this.createNewThread(title, content);
  }

  private createNewThread(title: string, firstMessage?: string): void {
    const user = this.userService.getCurrentUserSync();
    if (!user) return;

    this.isLoading = true;

    const request: CreateThreadRequest = {
      title,
      userId: user.id
    };

    this.threadService.createThread(request)
      .subscribe({
        next: (thread) => {
          // Load the full thread with messages
          this.threadService.getThread(thread.id)
            .subscribe({
              next: (fullThread) => {
                this.isLoading = false;
                
                // If there's a first message, send it
                if (firstMessage) {
                  this.onMessageSend(firstMessage);
                }
              },
              error: (error) => {
                console.error('Failed to load thread:', error);
                this.isLoading = false;
              }
            });
        },
        error: (error) => {
          console.error('Failed to create thread:', error);
          this.isLoading = false;
        }
      });
  }

  private simulateAIResponse(): void {
    // Simulate AI response after a delay
    setTimeout(() => {
      if (this.currentThread) {
        const responses = [
          "I understand your question. Let me help you with that.",
          "That's an interesting point. Here's what I think...",
          "I can help you with that. Let me provide some information.",
          "Thanks for your message. Here's my response...",
          "I see what you're asking. Let me explain..."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        this.messageService.createMessage({
          content: randomResponse,
          threadId: this.currentThread.id,
          role: MessageRole.ASSISTANT
        }).subscribe({
          error: (error) => {
            console.error('Failed to create AI response:', error);
          }
        });
      }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }
}