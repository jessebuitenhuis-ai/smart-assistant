import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadService, Thread, Message } from './services/thread.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') messageContainer?: ElementRef;

  threads: Thread[] = [];
  selectedThread: Thread | null = null;
  messages: Message[] = [];
  newMessage = '';
  isDrawerOpen = true;
  currentUserId = 'demo-user-1'; // Hard-coded for demo
  private shouldScroll = false;

  constructor(private threadService: ThreadService) {}

  async ngOnInit() {
    await this.loadThreads();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  async loadThreads() {
    try {
      this.threads = await this.threadService.getThreads(this.currentUserId);
    } catch (error) {
      console.error('Error loading threads:', error);
      this.threads = [];
    }
  }

  async createNewThread() {
    try {
      const newThread = await this.threadService.createThread({
        title: 'New Conversation',
        userId: this.currentUserId,
      });
      this.threads = [newThread, ...this.threads];
      await this.selectThread(newThread);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  }

  async selectThread(thread: Thread) {
    this.selectedThread = thread;
    await this.loadMessages();
  }

  async loadMessages() {
    if (!this.selectedThread) return;

    try {
      this.messages = await this.threadService.getMessages(
        this.selectedThread.id
      );
      this.shouldScroll = true;
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.selectedThread) return;

    const messageText = this.newMessage.trim();
    this.newMessage = '';

    try {
      // Send user message
      const userMessage = await this.threadService.createMessage({
        content: messageText,
        threadId: this.selectedThread.id,
        role: 'USER',
      });
      this.messages.push(userMessage);
      this.shouldScroll = true;

      // Simulate assistant response (replace with actual API call later)
      setTimeout(async () => {
        if (!this.selectedThread) return;
        const assistantMessage = await this.threadService.createMessage({
          content: 'Thanks for your message! This is a demo response.',
          threadId: this.selectedThread.id,
          role: 'ASSISTANT',
        });
        this.messages.push(assistantMessage);
        this.shouldScroll = true;
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async deleteThread(thread: Thread, event: Event) {
    event.stopPropagation();
    try {
      await this.threadService.deleteThread(thread.id);
      this.threads = this.threads.filter((t) => t.id !== thread.id);
      if (this.selectedThread?.id === thread.id) {
        this.selectedThread = null;
        this.messages = [];
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
