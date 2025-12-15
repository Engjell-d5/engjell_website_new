import { prisma } from '../prisma';
import type { ContactMessage } from './types';

export async function getContactMessages(): Promise<ContactMessage[]> {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  type MessageType = Awaited<ReturnType<typeof prisma.contactMessage.findMany>>[0];
  return messages.map((msg: MessageType) => ({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    submittedAt: msg.submittedAt.toISOString(),
    read: msg.read,
  }));
}

export async function saveContactMessages(messages: ContactMessage[]): Promise<void> {
  for (const message of messages) {
    await prisma.contactMessage.upsert({
      where: { id: message.id },
      update: {
        name: message.name,
        email: message.email,
        message: message.message,
        read: message.read,
      },
      create: {
        id: message.id,
        name: message.name,
        email: message.email,
        message: message.message,
        submittedAt: new Date(message.submittedAt),
        read: message.read,
      },
    });
  }
}

export async function addContactMessage(message: Omit<ContactMessage, 'id' | 'submittedAt' | 'read'>): Promise<ContactMessage> {
  const newMessage = await prisma.contactMessage.create({
    data: {
      name: message.name,
      email: message.email,
      message: message.message,
      submittedAt: new Date(),
      read: false,
    },
  });
  
  return {
    id: newMessage.id,
    name: newMessage.name,
    email: newMessage.email,
    message: newMessage.message,
    submittedAt: newMessage.submittedAt.toISOString(),
    read: newMessage.read,
  };
}

export async function markContactMessageAsRead(id: string): Promise<void> {
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await prisma.contactMessage.delete({
    where: { id },
  });
}

