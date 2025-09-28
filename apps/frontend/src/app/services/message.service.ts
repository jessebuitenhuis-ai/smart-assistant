import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Message, CreateMessageRequest, MessageRole } from '@smart-assistant/shared/types';
import { ThreadService } from './thread.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl = '/api/messages';

  constructor(
    private http: HttpClient,
    private threadService: ThreadService
  ) {}

  /**
   * Create a new message in a thread
   */
  createMessage(request: CreateMessageRequest): Observable<Message> {
    return this.http.post<Message>(this.baseUrl, request)
      .pipe(
        tap(newMessage => {
          // Update the current thread with the new message
          const currentThread = this.threadService.getCurrentThread();
          if (currentThread && currentThread.id === newMessage.threadId) {
            const updatedThread = {
              ...currentThread,
              messages: [...currentThread.messages, newMessage]
            };
            this.threadService.setCurrentThread(updatedThread);
          }
        })
      );
  }

  /**
   * Get messages for a specific thread
   */
  getMessagesForThread(threadId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}?threadId=${threadId}`);
  }

  /**
   * Update a message
   */
  updateMessage(messageId: string, content: string): Observable<Message> {
    return this.http.patch<Message>(`${this.baseUrl}/${messageId}`, { content })
      .pipe(
        tap(updatedMessage => {
          // Update the message in the current thread
          const currentThread = this.threadService.getCurrentThread();
          if (currentThread) {
            const messageIndex = currentThread.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
              const updatedMessages = [...currentThread.messages];
              updatedMessages[messageIndex] = updatedMessage;
              const updatedThread = {
                ...currentThread,
                messages: updatedMessages
              };
              this.threadService.setCurrentThread(updatedThread);
            }
          }
        })
      );
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${messageId}`)
      .pipe(
        tap(() => {
          // Remove the message from the current thread
          const currentThread = this.threadService.getCurrentThread();
          if (currentThread) {
            const updatedMessages = currentThread.messages.filter(m => m.id !== messageId);
            const updatedThread = {
              ...currentThread,
              messages: updatedMessages
            };
            this.threadService.setCurrentThread(updatedThread);
          }
        })
      );
  }

  /**
   * Send a user message and get AI response
   */
  sendMessage(threadId: string, content: string): Observable<Message> {
    const userMessageRequest: CreateMessageRequest = {
      content,
      threadId,
      role: MessageRole.USER
    };

    return this.createMessage(userMessageRequest);
  }
}