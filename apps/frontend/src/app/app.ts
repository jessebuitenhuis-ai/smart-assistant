import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreadSidebarContainer } from './containers/thread-sidebar/thread-sidebar.container';
import { ChatViewContainer } from './containers/chat-view/chat-view.container';
import { ThreadService } from './services/thread.service';
import { Thread } from '@smart-assistant/shared/types';

@Component({
  imports: [
    CommonModule,
    ThreadSidebarContainer,
    ChatViewContainer
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'Smart Assistant';

  constructor(private threadService: ThreadService) {}

  ngOnInit(): void {
    // Initialize the app
  }

  onThreadSelect(thread: Thread): void {
    // Load the selected thread with messages
    this.threadService.getThread(thread.id).subscribe({
      error: (error) => {
        console.error('Failed to load thread:', error);
        // In a real app, show error notification
      }
    });
  }

  onNewThread(): void {
    // Clear current thread to show empty state
    this.threadService.setCurrentThread(null);
  }
}
