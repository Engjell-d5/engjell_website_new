import { prisma } from '../prisma';
import type { Group } from './types';

export async function getGroups(): Promise<Group[]> {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'desc' },
  });
  type GroupType = Awaited<ReturnType<typeof prisma.group.findMany>>[0];
  return groups.map((group: GroupType) => ({
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  }));
}

export async function getGroup(id: string): Promise<Group | null> {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      subscribers: {
        select: {
          id: true,
          email: true,
          status: true,
        },
      },
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
      },
    },
  });
  
  if (!group) return null;
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function createGroup(data: {
  senderGroupId?: string;
  title: string;
  recipientCount?: number;
  activeSubscribers?: number;
  unsubscribedCount?: number;
  bouncedCount?: number;
  phoneCount?: number;
  activePhoneCount?: number;
}): Promise<Group> {
  const group = await prisma.group.create({
    data: {
      senderGroupId: data.senderGroupId,
      title: data.title,
      recipientCount: data.recipientCount || 0,
      activeSubscribers: data.activeSubscribers || 0,
      unsubscribedCount: data.unsubscribedCount || 0,
      bouncedCount: data.bouncedCount || 0,
      phoneCount: data.phoneCount || 0,
      activePhoneCount: data.activePhoneCount || 0,
      syncedAt: new Date(),
    },
  });
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function updateGroup(
  id: string,
  data: {
    title?: string;
    recipientCount?: number;
    activeSubscribers?: number;
    unsubscribedCount?: number;
    bouncedCount?: number;
    phoneCount?: number;
    activePhoneCount?: number;
  }
): Promise<Group> {
  const group = await prisma.group.update({
    where: { id },
    data: {
      ...data,
      syncedAt: new Date(),
    },
  });
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function deleteGroup(id: string): Promise<void> {
  await prisma.group.delete({
    where: { id },
  });
}

export async function syncGroupFromSender(senderGroup: any): Promise<Group> {
  // Find existing group by senderGroupId
  const existing = senderGroup.id
    ? await prisma.group.findUnique({
        where: { senderGroupId: senderGroup.id },
      })
    : null;

  const groupData = {
    senderGroupId: senderGroup.id,
    title: senderGroup.title,
    recipientCount: senderGroup.recipient_count || 0,
    activeSubscribers: senderGroup.active_subscribers || 0,
    unsubscribedCount: senderGroup.unsubscribed_count || 0,
    bouncedCount: senderGroup.bounced_count || 0,
    phoneCount: senderGroup.phone_count || 0,
    activePhoneCount: senderGroup.active_phone_count || 0,
    syncedAt: new Date(),
  };

  if (existing) {
    return await updateGroup(existing.id, groupData);
  } else {
    return await createGroup(groupData);
  }
}

