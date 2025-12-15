import { prisma } from '../prisma';
import type { Subscriber } from './types';

export async function getSubscribers(): Promise<Subscriber[]> {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
  return subscribers.map((sub: any) => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
    groupId: sub.groupId,
    group: sub.group ? {
      id: sub.group.id,
      title: sub.group.title,
    } : null,
    groups: (sub.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  }));
}

export async function getSubscriber(id: string): Promise<Subscriber | null> {
  const subscriber = await prisma.subscriber.findUnique({
    where: { id },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  if (!subscriber) return null;
  
  return {
    id: subscriber.id,
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt.toISOString(),
    syncedToSender: subscriber.syncedToSender,
    status: (subscriber.status as 'active' | 'churned') || 'active',
    groupId: subscriber.groupId,
    group: subscriber.group ? {
      id: subscriber.group.id,
      title: subscriber.group.title,
    } : null,
    groups: (subscriber.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  for (const subscriber of subscribers) {
    await prisma.subscriber.upsert({
      where: { email: subscriber.email },
      update: {
        syncedToSender: subscriber.syncedToSender,
        status: subscriber.status || 'active',
      },
      create: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: new Date(subscriber.subscribedAt),
        syncedToSender: subscriber.syncedToSender,
        status: subscriber.status || 'active',
      },
    });
  }
}

export async function addSubscriber(
  email: string, 
  status: 'active' | 'churned' = 'active', 
  groupId?: string | null,
  groupIds?: string[]
): Promise<Subscriber> {
  const existing = await prisma.subscriber.findUnique({
    where: { email: email.toLowerCase() },
  });
  
  if (existing) {
    throw new Error('Email already subscribed');
  }
  
  const newSubscriber = await prisma.subscriber.create({
    data: {
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      syncedToSender: false,
      status: status,
      groupId: groupId || null,
      groups: groupIds && groupIds.length > 0 ? {
        create: groupIds.map((gId: string) => ({ groupId: gId })),
      } : undefined,
    },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  return {
    id: newSubscriber.id,
    email: newSubscriber.email,
    subscribedAt: newSubscriber.subscribedAt.toISOString(),
    syncedToSender: newSubscriber.syncedToSender,
    status: (newSubscriber.status as 'active' | 'churned') || 'active',
    groupId: newSubscriber.groupId,
    group: newSubscriber.group ? {
      id: newSubscriber.group.id,
      title: newSubscriber.group.title,
    } : null,
    groups: (newSubscriber.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function updateSubscriber(
  id: string, 
  data: { 
    email?: string; 
    status?: 'active' | 'churned'; 
    groupId?: string | null;
    groupIds?: string[];
  }
): Promise<Subscriber> {
  const updateData: any = {};
  if (data.email !== undefined) {
    updateData.email = data.email.toLowerCase();
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.groupId !== undefined) {
    updateData.groupId = data.groupId;
  }
  
  // Handle multiple groups
  if (data.groupIds !== undefined) {
    // Delete existing group associations
    await (prisma as any).subscriberGroup.deleteMany({
      where: { subscriberId: id },
    });
    
    // Create new group associations
    // SQLite doesn't support skipDuplicates in createMany, so we use individual creates
    if (data.groupIds.length > 0) {
      for (const groupId of data.groupIds) {
        try {
          await (prisma as any).subscriberGroup.create({
            data: {
              subscriberId: id,
              groupId: groupId,
            },
          });
        } catch (error: any) {
          // Ignore unique constraint errors (duplicates)
          // P2002 is Prisma's unique constraint violation code
          if (error.code !== 'P2002' && !error.message?.includes('Unique constraint')) {
            throw error;
          }
        }
      }
    }
  }
  
  const updated = await prisma.subscriber.update({
    where: { id },
    data: updateData,
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  return {
    id: updated.id,
    email: updated.email,
    subscribedAt: updated.subscribedAt.toISOString(),
    syncedToSender: updated.syncedToSender,
    status: (updated.status as 'active' | 'churned') || 'active',
    groupId: updated.groupId,
    group: updated.group ? {
      id: updated.group.id,
      title: updated.group.title,
    } : null,
    groups: (updated.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function deleteSubscriber(id: string): Promise<void> {
  await prisma.subscriber.delete({
    where: { id },
  });
}

export async function markSubscriberSynced(email: string): Promise<void> {
  await prisma.subscriber.updateMany({
    where: { email: email.toLowerCase() },
    data: { syncedToSender: true },
  });
}

export async function getUnsyncedSubscribers(): Promise<Subscriber[]> {
  const subscribers = await prisma.subscriber.findMany({
    where: { 
      syncedToSender: false,
      status: 'active', // Only sync active subscribers
    },
    orderBy: { subscribedAt: 'desc' },
  });
  type SubscriberType = Awaited<ReturnType<typeof prisma.subscriber.findMany>>[0];
  return subscribers.map((sub: SubscriberType) => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
  }));
}

