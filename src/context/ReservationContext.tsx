import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Reservation, Order, CartItem, ReservationStatus, ArrivalStatus, SeatingArea, OrderStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateQR } from '@/lib/utils';

interface ReservationContextValue {
  reservations: Reservation[];
  orders: Order[];
  loading: boolean;
  addReservation: (data: Omit<Reservation, 'id' | 'qrCode' | 'createdAt' | 'status' | 'arrivalStatus' | 'prepStatus'>) => Promise<Reservation>;
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<void>;
  addOrder: (data: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrder: (id: string, status: Order['status']) => Promise<void>;
  getReservation: (id: string) => Reservation | undefined;
  getUserReservations: (userId: string) => Reservation[];
  getRestaurantReservations: (restaurantId: string) => Reservation[];
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

type ReservationRow = {
  id: string;
  reservation_code: string;
  restaurant_id: string;
  customer_id: string;
  table_id: string | null;
  date: string;
  time: string;
  guests: number;
  duration: number;
  seating_area: SeatingArea;
  status: ReservationStatus;
  arrival_status: ArrivalStatus;
  arrival_time: string;
  expected_arrival: string;
  prep_start_time: string;
  prep_status: OrderStatus;
  qr_code: string;
  deposit: number;
  notes: string;
  created_at: string;
  restaurants: { name: string } | null;
  profiles: { name: string } | null;
  restaurant_tables: { code: string } | null;
};

type OrderRow = {
  id: string;
  order_code: string;
  restaurant_id: string;
  customer_id: string;
  reservation_id: string | null;
  total: number;
  status: string;
  payment_status: string;
  prep_option: 'confirm_later' | 'prepare_on_arrival';
  scheduled_prep_time: string;
  created_at: string;
};

function mapReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurants?.name ?? '',
    customerId: row.customer_id,
    customerName: row.profiles?.name ?? '',
    date: row.date,
    time: row.time,
    guests: row.guests,
    duration: row.duration,
    tableId: row.table_id ?? '',
    tableCode: row.restaurant_tables?.code ?? '',
    seatingArea: row.seating_area,
    status: row.status,
    arrivalStatus: row.arrival_status,
    arrivalTime: row.arrival_time,
    expectedArrival: row.expected_arrival,
    prepStartTime: row.prep_start_time || undefined,
    prepStatus: row.prep_status,
    qrCode: row.qr_code || row.reservation_code,
    deposit: row.deposit || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function mapOrder(row: OrderRow, items: CartItem[]): Order {
  return {
    id: row.id,
    reservationId: row.reservation_id ?? undefined,
    restaurantId: row.restaurant_id,
    customerId: row.customer_id,
    items,
    total: Number(row.total),
    status: mapOrderStatus(row.status),
    prepOption: row.prep_option,
    scheduledPrepTime: row.scheduled_prep_time || undefined,
    createdAt: row.created_at,
  };
}

function mapOrderStatus(dbStatus: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    pending_payment: 'new',
    payment_failed: 'new',
    confirmed: 'new',
    scheduled: 'scheduled',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
    completed: 'completed',
    cancelled: 'cancelled',
    refunded: 'cancelled',
  };
  return map[dbStatus] ?? 'new';
}

function toDbOrderStatus(appStatus: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new: 'confirmed',
    scheduled: 'scheduled',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  return map[appStatus] ?? 'confirmed';
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, restaurants(name), profiles!customer_id(name), restaurant_tables!table_id(code)')
      .or(`customer_id.eq.${userId},restaurant_id.in.(select id from restaurants where owner_id eq.${userId})`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch reservations:', error);
      return;
    }
    setReservations((data as unknown as ReservationRow[]).map(mapReservation));
  }, []);

  const fetchOrders = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`customer_id.eq.${userId},restaurant_id.in.(select id from restaurants where owner_id eq.${userId})`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders:', error);
      return;
    }

    const orderRows = data as unknown as OrderRow[];
    const ordersWithItems: Order[] = [];

    for (const row of orderRows) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', row.id);

      const cartItems: CartItem[] = (items ?? []).map((i: { menu_item_id: string; name: string; price: number; image: string; quantity: number; instructions: string; prep_time: number; prep_category: string }) => ({
        menuItemId: i.menu_item_id ?? '',
        name: i.name,
        price: Number(i.price),
        image: i.image,
        quantity: i.quantity,
        instructions: i.instructions || undefined,
        prepTime: i.prep_time,
        prepCategory: i.prep_category as CartItem['prepCategory'],
      }));

      ordersWithItems.push(mapOrder(row, cartItems));
    }

    setOrders(ordersWithItems);
  }, []);

  useEffect(() => {
    if (!user) {
      setReservations([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([fetchReservations(user.id), fetchOrders(user.id)]).finally(() => setLoading(false));
  }, [user, fetchReservations, fetchOrders]);

  const addReservation: ReservationContextValue['addReservation'] = async (data) => {
    const insertPayload = {
      restaurant_id: data.restaurantId,
      customer_id: data.customerId,
      table_id: data.tableId || null,
      date: data.date,
      time: data.time,
      guests: data.guests,
      duration: data.duration,
      seating_area: data.seatingArea,
      status: 'confirmed' as ReservationStatus,
      arrival_status: 'on_time' as ArrivalStatus,
      arrival_time: data.arrivalTime,
      expected_arrival: data.expectedArrival,
      prep_start_time: data.prepStartTime ?? '',
      prep_status: 'scheduled' as OrderStatus,
      qr_code: generateQR(),
      deposit: data.deposit ?? 0,
      notes: data.notes ?? '',
    };

    const { data: inserted, error } = await supabase
      .from('reservations')
      .insert(insertPayload)
      .select('*, restaurants(name), profiles!customer_id(name), restaurant_tables!table_id(code)')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? 'Failed to create reservation');
    }

    const reservation = mapReservation(inserted as unknown as ReservationRow);
    setReservations((prev) => [reservation, ...prev]);
    return reservation;
  };

  const updateReservation: ReservationContextValue['updateReservation'] = async (id, data) => {
    const updatePayload: Record<string, unknown> = {};
    if (data.status) updatePayload.status = data.status;
    if (data.arrivalStatus) updatePayload.arrival_status = data.arrivalStatus;
    if (data.arrivalTime !== undefined) updatePayload.arrival_time = data.arrivalTime;
    if (data.expectedArrival !== undefined) updatePayload.expected_arrival = data.expectedArrival;
    if (data.prepStartTime !== undefined) updatePayload.prep_start_time = data.prepStartTime;
    if (data.prepStatus) updatePayload.prep_status = data.prepStatus;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const { error } = await supabase
      .from('reservations')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(error.message);

    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const addOrder: ReservationContextValue['addOrder'] = async (data) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: data.restaurantId,
        customer_id: data.customerId,
        reservation_id: data.reservationId ?? null,
        total: data.total,
        status: 'confirmed',
        payment_status: 'pending',
        prep_option: data.prepOption,
        scheduled_prep_time: data.scheduledPrepTime ?? '',
      })
      .select('*')
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message ?? 'Failed to create order');
    }

    const orderRow = orderData as unknown as OrderRow;

    if (data.items.length > 0) {
      const itemInserts = data.items.map((item) => ({
        order_id: orderRow.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        instructions: item.instructions ?? '',
        prep_time: item.prepTime,
        prep_category: item.prepCategory,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemInserts);
      if (itemsError) console.error('Failed to insert order items:', itemsError);
    }

    const order = mapOrder(orderRow, data.items);
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateOrder: ReservationContextValue['updateOrder'] = async (id, status) => {
    const dbStatus = toDbOrderStatus(status);
    const { error } = await supabase
      .from('orders')
      .update({ status: dbStatus })
      .eq('id', id);

    if (error) throw new Error(error.message);

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const getReservation = (id: string) => reservations.find((r) => r.id === id);
  const getUserReservations = (userId: string) => reservations.filter((r) => r.customerId === userId);
  const getRestaurantReservations = (restaurantId: string) => reservations.filter((r) => r.restaurantId === restaurantId);

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        orders,
        loading,
        addReservation,
        updateReservation,
        addOrder,
        updateOrder,
        getReservation,
        getUserReservations,
        getRestaurantReservations,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservations must be used within ReservationProvider');
  return ctx;
}
