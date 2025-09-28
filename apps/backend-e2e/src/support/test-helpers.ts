import { PrismaClient, User, Thread, Message, MessageRole } from '@prisma/client';

export class TestHelpers {
  private static prisma = new PrismaClient();

  static async cleanDatabase(): Promise<void> {
    // Clean in reverse order of dependencies to avoid foreign key constraints
    await this.prisma.message.deleteMany();
    await this.prisma.thread.deleteMany();
    await this.prisma.user.deleteMany();
  }

  static async seedTestData(): Promise<{
    users: User[];
    threads: Thread[];
    messages: Message[];
  }> {
    // Create test users
    const users = await Promise.all([
      this.prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          name: 'John Doe',
        },
      }),
      this.prisma.user.create({
        data: {
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
        },
      }),
    ]);

    // Create test threads
    const threads = await Promise.all([
      this.prisma.thread.create({
        data: {
          title: 'Test Thread 1',
          userId: users[0].id,
        },
      }),
      this.prisma.thread.create({
        data: {
          title: 'Test Thread 2',
          userId: users[0].id,
        },
      }),
      this.prisma.thread.create({
        data: {
          title: 'Jane\'s Thread',
          userId: users[1].id,
        },
      }),
    ]);

    // Create test messages
    const messages = await Promise.all([
      this.prisma.message.create({
        data: {
          content: 'Hello, this is a test message',
          threadId: threads[0].id,
          role: MessageRole.USER,
        },
      }),
      this.prisma.message.create({
        data: {
          content: 'This is an assistant response',
          threadId: threads[0].id,
          role: MessageRole.ASSISTANT,
        },
      }),
      this.prisma.message.create({
        data: {
          content: 'Another user message',
          threadId: threads[1].id,
          role: MessageRole.USER,
        },
      }),
    ]);

    return { users, threads, messages };
  }

  static async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  static getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}
