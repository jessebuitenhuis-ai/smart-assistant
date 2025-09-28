export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  threadId: string;
  role: MessageRole;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend-specific types
export interface CreateThreadRequest {
  title: string;
  userId: string;
}

export interface CreateMessageRequest {
  content: string;
  threadId: string;
  role: MessageRole;
}

export interface ThreadWithMessages extends Thread {
  messages: Message[];
}
