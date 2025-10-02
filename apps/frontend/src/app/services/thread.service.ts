import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Thread {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  threadId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadDto {
  title: string;
  userId: string;
}

export interface CreateMessageDto {
  content: string;
  threadId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
}

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private apiUrl = environment.apiUrl || 'https://smart-assistant-3jaj.onrender.com';

  async getThreads(userId?: string): Promise<Thread[]> {
    const url = userId
      ? `${this.apiUrl}/api/threads?userId=${userId}`
      : `${this.apiUrl}/api/threads`;
    const response = await fetch(url);
    return response.json();
  }

  async createThread(data: CreateThreadDto): Promise<Thread> {
    const response = await fetch(`${this.apiUrl}/api/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteThread(id: string): Promise<void> {
    await fetch(`${this.apiUrl}/api/threads/${id}`, {
      method: 'DELETE',
    });
  }

  async getMessages(threadId: string): Promise<Message[]> {
    const response = await fetch(
      `${this.apiUrl}/api/messages?threadId=${threadId}`
    );
    return response.json();
  }

  async createMessage(data: CreateMessageDto): Promise<Message> {
    const response = await fetch(`${this.apiUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
