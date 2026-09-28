export const STATUSES = [
  { id: 'wishlist', label: 'Wishlist', tone: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  { id: 'applied', label: 'Applied', tone: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  { id: 'interview', label: 'Interview', tone: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  { id: 'offer', label: 'Offer', tone: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { id: 'rejected', label: 'Closed', tone: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
];

export function statusMeta(id) {
  return STATUSES.find((s) => s.id === id) || STATUSES[0];
}

export function daysUntil(deadline) {
  if (!deadline) return null;
  const d = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
