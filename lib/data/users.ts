import { prisma } from '../prisma';
import type { User } from './types';

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  type UserType = Awaited<ReturnType<typeof prisma.user.findMany>>[0];
  return users.map((user: UserType) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    password: user.password,
    role: user.role as 'admin' | 'editor',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

export async function saveUsers(users: User[]): Promise<void> {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
}

