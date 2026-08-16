export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function priceRangeLabel(range: number): string {
  return '₹'.repeat(range);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateReservationId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `DF${num}`;
}

export function generateQR(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function calculatePrepStart(arrivalTime: string, prepTime: number, buffer = 5): string {
  const [h, m] = arrivalTime.split(':').map(Number);
  const totalMinutes = h * 60 + m - prepTime - buffer;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

export function isRestaurantOpen(restaurant: { openingHours: string; closingHours: string; workingDays: string[] }, dateStr?: string): boolean {
  const day = dateStr ? getDayOfWeek(dateStr) : new Date().toLocaleDateString('en-US', { weekday: 'short' });
  if (!restaurant.workingDays.includes(day)) return false;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = restaurant.openingHours.split(':').map(Number);
  const [ch, cm] = restaurant.closingHours.split(':').map(Number);
  return currentMin >= oh * 60 + om && currentMin <= ch * 60 + cm;
}

export function mockDistance(lat1: number, lng1: number, lat2 = 11.2588, lng2 = 75.7804): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
