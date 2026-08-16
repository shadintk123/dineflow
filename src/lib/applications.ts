import type { RestaurantApplication } from '@/types';
import { generateId } from './utils';

const KEY = 'dineflow_applications';

export function getApplications(): RestaurantApplication[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as RestaurantApplication[];
  } catch { /* ignore */ }
  return [];
}

export function saveApplications(apps: RestaurantApplication[]): void {
  localStorage.setItem(KEY, JSON.stringify(apps));
}

export function createApplication(data: Omit<RestaurantApplication, 'id' | 'status' | 'submittedAt'>): RestaurantApplication {
  const apps = getApplications();
  const app: RestaurantApplication = {
    ...data,
    id: generateId('app'),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  apps.unshift(app);
  saveApplications(apps);
  return app;
}

export function updateApplicationStatus(id: string, status: 'approved' | 'rejected', adminNotes?: string): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx >= 0) {
    apps[idx] = { ...apps[idx], status, reviewedAt: new Date().toISOString(), adminNotes };
    saveApplications(apps);
  }
}

export function getApplicationsByOwner(ownerId: string): RestaurantApplication[] {
  return getApplications().filter((a) => a.ownerId === ownerId);
}
