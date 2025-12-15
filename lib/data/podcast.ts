import { prisma } from '../prisma';
import type { PodcastApplication } from './types';

export async function getPodcastApplications(): Promise<PodcastApplication[]> {
  const applications = await prisma.podcastApplication.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  type ApplicationType = Awaited<ReturnType<typeof prisma.podcastApplication.findMany>>[0];
  return applications.map((app: ApplicationType) => ({
    id: app.id,
    name: app.name,
    email: app.email,
    about: app.about,
    businesses: app.businesses,
    industry: app.industry,
    vision: app.vision,
    biggestChallenge: app.biggestChallenge,
    whyPodcast: app.whyPodcast,
    submittedAt: app.submittedAt.toISOString(),
    status: app.status as 'pending' | 'reviewed' | 'approved' | 'rejected',
  }));
}

export async function savePodcastApplications(applications: PodcastApplication[]): Promise<void> {
  for (const app of applications) {
    await prisma.podcastApplication.upsert({
      where: { id: app.id },
      update: {
        name: app.name,
        email: app.email,
        about: app.about,
        businesses: app.businesses,
        industry: app.industry,
        vision: app.vision,
        biggestChallenge: app.biggestChallenge,
        whyPodcast: app.whyPodcast,
        status: app.status,
      },
      create: {
        id: app.id,
        name: app.name,
        email: app.email,
        about: app.about,
        businesses: app.businesses,
        industry: app.industry,
        vision: app.vision,
        biggestChallenge: app.biggestChallenge,
        whyPodcast: app.whyPodcast,
        submittedAt: new Date(app.submittedAt),
        status: app.status,
      },
    });
  }
}

export async function addPodcastApplication(application: Omit<PodcastApplication, 'id' | 'submittedAt' | 'status'>): Promise<PodcastApplication> {
  const newApplication = await prisma.podcastApplication.create({
    data: {
      name: application.name,
      email: application.email,
      about: application.about,
      businesses: application.businesses,
      industry: application.industry,
      vision: application.vision,
      biggestChallenge: application.biggestChallenge,
      whyPodcast: application.whyPodcast,
      submittedAt: new Date(),
      status: 'pending',
    },
  });
  
  return {
    id: newApplication.id,
    name: newApplication.name,
    email: newApplication.email,
    about: newApplication.about,
    businesses: newApplication.businesses,
    industry: newApplication.industry,
    vision: newApplication.vision,
    biggestChallenge: newApplication.biggestChallenge,
    whyPodcast: newApplication.whyPodcast,
    submittedAt: newApplication.submittedAt.toISOString(),
    status: newApplication.status as 'pending' | 'reviewed' | 'approved' | 'rejected',
  };
}

export async function updatePodcastApplicationStatus(id: string, status: PodcastApplication['status']): Promise<void> {
  await prisma.podcastApplication.update({
    where: { id },
    data: { status },
  });
}

