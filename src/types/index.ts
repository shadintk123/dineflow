export type UserRole = 'customer' | 'owner' | 'admin';

export type RestaurantStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'unavailable';

export type SeatingArea = 'main_hall' | 'family' | 'outdoor' | 'private' | 'vip';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type OrderStatus =
  | 'new'
  | 'scheduled'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type ArrivalStatus = 'on_time' | 'en_route' | 'running_late' | 'arrived';

export type PrepCategory = 'quick' | 'standard' | 'long' | 'after_arrival';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  cuisine: string[];
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  landmark?: string;
  lat: number;
  lng: number;
  openingHours: string;
  closingHours: string;
  workingDays: string[];
  seatingCapacity: number;
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  logo: string;
  cover: string;
  photos: string[];
  amenities: string[];
  status: RestaurantStatus;
  onlineCapacity: number;
  walkInCapacity: number;
  flexibleCapacity: number;
  gracePeriod: number;
  depositEnabled: boolean;
  depositAmount: number;
  maxPrepLoad: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  available: boolean;
  prepTime: number;
  prepCategory: PrepCategory;
  popular?: boolean;
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  code: string;
  capacity: number;
  area: SeatingArea;
  status: TableStatus;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  instructions?: string;
  prepTime: number;
  prepCategory: PrepCategory;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  duration: number;
  tableId: string;
  tableCode: string;
  seatingArea: SeatingArea;
  status: ReservationStatus;
  arrivalStatus: ArrivalStatus;
  arrivalTime: string;
  expectedArrival: string;
  prepStartTime?: string;
  prepStatus: OrderStatus;
  qrCode: string;
  deposit?: number;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  reservationId?: string;
  restaurantId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  prepOption: 'confirm_later' | 'prepare_on_arrival';
  scheduledPrepTime?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  ownerReply?: string;
}

export interface Complaint {
  id: string;
  type: 'fake_restaurant' | 'incorrect_info' | 'reservation' | 'payment' | 'service';
  reporterName: string;
  restaurantId?: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface RestaurantApplication {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  restaurantName: string;
  description: string;
  cuisine: string[];
  restaurantPhone: string;
  restaurantEmail: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  landmark?: string;
  openingHours: string;
  closingHours: string;
  seatingCapacity: number;
  tables: number;
  priceRange: 1 | 2 | 3 | 4;
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}
