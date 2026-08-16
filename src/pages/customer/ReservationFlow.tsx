import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar, Clock, Users, MapPin, Check, ArrowRight, ArrowLeft,
  UtensilsCrossed, Timer, ChefHat, ShoppingBag, Bell, QrCode,
  CheckCircle2, AlertCircle, Navigation
} from 'lucide-react';
import { sampleRestaurants, sampleTables, sampleMenuItems } from '@/data/restaurants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useReservations } from '@/context/ReservationContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { cn, formatPrice, formatTime, getToday, calculatePrepStart, addMinutes } from '@/lib/utils';
import type { SeatingArea, TableStatus, CartItem } from '@/types';

const steps = ['Date & Time', 'Seating Area', 'Select Table', 'Pre-Order', 'Arrival', 'Confirm'];

const seatingAreas: { id: SeatingArea; label: string; desc: string; icon: string }[] = [
  { id: 'main_hall', label: 'Main Hall', desc: 'Classic indoor dining', icon: '🏛️' },
  { id: 'family', label: 'Family Area', desc: 'Spacious family seating', icon: '👨‍👩‍👧' },
  { id: 'outdoor', label: 'Outdoor Area', desc: 'Open-air dining', icon: '🌿' },
  { id: 'private', label: 'Private Dining', desc: 'Exclusive private space', icon: '🔒' },
  { id: 'vip', label: 'VIP Area', desc: 'Premium VIP experience', icon: '⭐' },
];

const tableStatusConfig: Record<TableStatus, { label: string; color: string; selectable: boolean }> = {
  available: { label: 'Available', color: 'border-success bg-success/5 text-success', selectable: true },
  reserved: { label: 'Reserved', color: 'border-warning bg-warning/5 text-warning', selectable: false },
  occupied: { label: 'Occupied', color: 'border-error bg-error/5 text-error', selectable: false },
  cleaning: { label: 'Cleaning', color: 'border-accent-300 bg-accent-50 text-accent-600', selectable: false },
  unavailable: { label: 'Unavailable', color: 'border-line bg-ivory text-muted', selectable: false },
};

export function ReservationFlow() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, count, clearCart, restaurantId } = useCart();
  const { addReservation, addOrder } = useReservations();
  const { success, warning } = useToast();

  const restaurantParam = params.get('restaurant');
  const initialRestaurant = sampleRestaurants.find((r) => r.id === restaurantParam) || sampleRestaurants[0];

  const [step, setStep] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState(initialRestaurant);
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [duration, setDuration] = useState(90);
  const [seatingArea, setSeatingArea] = useState<SeatingArea | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [prepOption, setPrepOption] = useState<'confirm_later' | 'prepare_on_arrival'>('prepare_on_arrival');
  const [arrivalStatus, setArrivalStatus] = useState<'on_time' | 'en_route' | 'running_late' | 'arrived'>('on_time');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [confirmedReservation, setConfirmedReservation] = useState<{ id: string; qrCode: string } | null>(null);

  const tables = sampleTables.filter((t) => t.restaurantId === selectedRestaurant.id);
  const areaTables = seatingArea ? tables.filter((t) => t.area === seatingArea) : [];

  const expectedArrival = delayMinutes > 0 ? addMinutes(time, delayMinutes) : time;
  const maxPrepTime = items.length > 0 ? Math.max(...items.map((i) => i.prepTime)) : 20;
  const recommendedPrepStart = calculatePrepStart(expectedArrival, maxPrepTime, 5);

  if (!user) {
    return (
      <div className="pt-24 container-app text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-warning" />
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Please sign in to make a reservation</h1>
        <Link to="/login"><Button variant="primary" size="lg" className="mt-4">Sign In</Button></Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    const table = tables.find((t) => t.id === selectedTable);
    if (!table || !seatingArea) return;

    const reservation = await addReservation({
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      customerId: user.id,
      customerName: user.name,
      date,
      time,
      guests,
      duration,
      tableId: table.id,
      tableCode: table.code,
      seatingArea,
      arrivalTime: expectedArrival,
      expectedArrival,
      prepStartTime: prepOption === 'prepare_on_arrival' ? recommendedPrepStart : undefined,
      deposit: selectedRestaurant.depositEnabled ? selectedRestaurant.depositAmount : undefined,
    });

    if (items.length > 0) {
      await addOrder({
        reservationId: reservation.id,
        restaurantId: selectedRestaurant.id,
        customerId: user.id,
        items: items as CartItem[],
        total,
        prepOption,
        scheduledPrepTime: prepOption === 'prepare_on_arrival' ? recommendedPrepStart : undefined,
      });
      clearCart();
    }

    setConfirmedReservation({ id: reservation.id, qrCode: reservation.qrCode });
    success('Reservation confirmed!', `Your table at ${selectedRestaurant.name} is reserved.`);

    try {
      await supabase.functions.invoke('whatsapp-notify', {
        body: {
          reservation_id: reservation.id,
          restaurant_id: selectedRestaurant.id,
          event_type: 'created',
          customer_name: user.name,
          customer_phone: user.phone ?? '',
          restaurant_name: selectedRestaurant.name,
          date,
          time: formatTime(time),
          guests,
          table_code: table.code,
          reservation_code: reservation.id,
          reservation_status: 'confirmed',
        },
      });
    } catch {
      // WhatsApp notification is best-effort; reservation still succeeds
    }
  };

  if (confirmedReservation) {
    return (
      <div className="pt-20 min-h-screen bg-ivory bg-grid flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-lift"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-ink">Your table is reserved.</h1>
          <p className="mt-2 text-muted">Your meal will be timed around your arrival.</p>

          <div className="mt-6 flex justify-center">
            <div className="rounded-2xl border-2 border-primary-600 bg-white p-4">
              <QRCodeSVG value={`dineflow://checkin/${confirmedReservation.id}`} size={160} bgColor="#FFFFFF" fgColor="#1F4D3A" level="M" />
              <p className="mt-2 text-center text-xs font-bold text-primary-700">{confirmedReservation.id}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2 rounded-xl bg-ivory p-5 text-left text-sm">
            <div className="flex justify-between"><span className="text-muted">Restaurant</span><span className="font-bold text-ink">{selectedRestaurant.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">Date</span><span className="font-bold text-ink">{date}</span></div>
            <div className="flex justify-between"><span className="text-muted">Time</span><span className="font-bold text-ink">{formatTime(time)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Guests</span><span className="font-bold text-ink">{guests}</span></div>
            <div className="flex justify-between"><span className="text-muted">Table</span><span className="font-bold text-ink">{tables.find((t) => t.id === selectedTable)?.code}</span></div>
            <div className="flex justify-between"><span className="text-muted">Area</span><span className="font-bold text-ink">{seatingAreas.find((a) => a.id === seatingArea)?.label}</span></div>
            {items.length > 0 && (
              <>
                <div className="flex justify-between"><span className="text-muted">Pre-order</span><span className="font-bold text-ink">{count} items · {formatPrice(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Prep starts</span><span className="font-bold text-ink">{formatTime(recommendedPrepStart)}</span></div>
              </>
            )}
            <div className="flex justify-between border-t border-line pt-2"><span className="text-muted">Address</span><span className="font-bold text-ink text-right text-xs">{selectedRestaurant.address}</span></div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/customer/reservations" className="flex-1">
              <Button variant="primary" size="lg" fullWidth>View My Reservations</Button>
            </Link>
            <Link to="/explore" className="flex-1">
              <Button variant="secondary" size="lg" fullWidth>Explore More</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-ivory">
      <div className="container-narrow py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink lg:text-3xl">Reserve a Table</h1>
            <p className="mt-1 text-sm text-muted">{selectedRestaurant.name} · {selectedRestaurant.city}</p>
          </div>
          <Badge variant={selectedRestaurant.depositEnabled ? 'warning' : 'default'}>
            {selectedRestaurant.depositEnabled ? `₹${selectedRestaurant.depositAmount} deposit` : 'No deposit'}
          </Badge>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-between overflow-x-auto scrollbar-hide">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i === step ? 'bg-primary-600 text-white shadow-soft' : i < step ? 'bg-success text-white' : 'bg-ivory text-muted border border-line'
                )}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('mt-1.5 hidden text-[10px] font-semibold sm:block', i === step ? 'text-primary-700' : 'text-muted')}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className={cn('mx-1 h-0.5 flex-1 rounded min-w-4', i < step ? 'bg-success' : 'bg-line')} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Date & Time */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">When would you like to dine?</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-field"><Calendar className="inline h-4 w-4 mr-1" />Date</label>
                    <input type="date" min={getToday()} value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field"><Clock className="inline h-4 w-4 mr-1" />Time</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label-field"><Users className="inline h-4 w-4 mr-1" />Number of Guests</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 6, 8].map((n) => (
                      <button key={n} onClick={() => setGuests(n)} className={cn('flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition-all', guests === n ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-ivory text-ink hover:border-primary-300')}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field"><Timer className="inline h-4 w-4 mr-1" />Expected Dining Duration</label>
                  <div className="flex gap-2">
                    {[60, 90, 120, 150, 180].map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={cn('rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all', duration === d ? 'border-primary-600 bg-primary-600 text-white' : 'border-line bg-ivory text-ink hover:border-primary-300')}>
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </motion.div>
            )}

            {/* Step 1: Seating Area */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Choose your seating area</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {seatingAreas.map((area) => {
                    const areaTableCount = tables.filter((t) => t.area === area.id && t.status === 'available').length;
                    return (
                      <button
                        key={area.id}
                        onClick={() => { setSeatingArea(area.id); setSelectedTable(null); }}
                        className={cn(
                          'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                          seatingArea === area.id ? 'border-primary-600 bg-primary-50 shadow-soft' : 'border-line bg-surface hover:border-primary-300'
                        )}
                      >
                        <span className="text-2xl">{area.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold text-ink">{area.label}</p>
                          <p className="text-xs text-muted">{area.desc}</p>
                          <p className="mt-1 text-xs font-semibold text-primary-700">{areaTableCount} tables available</p>
                        </div>
                        {seatingArea === area.id && <Check className="h-5 w-5 text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(2)} disabled={!seatingArea}>Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Table Selection */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Select your table</h2>
                <p className="text-sm text-muted">Available tables in {seatingAreas.find((a) => a.id === seatingArea)?.label}. Tap to select.</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {areaTables.map((table) => {
                    const config = tableStatusConfig[table.status];
                    const isSelected = selectedTable === table.id;
                    const canSelect = config.selectable && table.capacity >= guests;
                    return (
                      <button
                        key={table.id}
                        onClick={() => canSelect && setSelectedTable(table.id)}
                        disabled={!canSelect}
                        className={cn(
                          'relative rounded-2xl border-2 p-4 text-center transition-all',
                          isSelected ? 'border-primary-600 bg-primary-600 text-white shadow-lift scale-105' :
                          canSelect ? cn('border-2', config.color, 'hover:scale-105 hover:shadow-soft') :
                          'border-line bg-ivory opacity-50 cursor-not-allowed'
                        )}
                      >
                        {isSelected && <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-400 text-white shadow-soft"><Check className="h-3.5 w-3.5" /></div>}
                        <div className={cn('mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl border-2', isSelected ? 'border-white/30' : 'border-current')}>
                          <UtensilsCrossed className={cn('h-5 w-5', isSelected ? 'text-white' : '')} />
                        </div>
                        <p className={cn('font-display text-sm font-bold', isSelected ? 'text-white' : 'text-ink')}>{table.code}</p>
                        <p className={cn('text-xs', isSelected ? 'text-white/80' : 'text-muted')}>{table.capacity} seats</p>
                        <p className={cn('mt-1 text-[10px] font-semibold', isSelected ? 'text-white/80' : config.color.split(' ').pop())}>{config.label}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedTable && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-primary-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm font-bold text-ink">Table {tables.find((t) => t.id === selectedTable)?.code} selected</p>
                        <p className="text-xs text-muted">{seatingAreas.find((a) => a.id === seatingArea)?.label} · {tables.find((t) => t.id === selectedTable)?.capacity} seats</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(3)} disabled={!selectedTable}>Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pre-Order */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Pre-order food (optional)</h2>
                <p className="text-sm text-muted">Add food to your reservation and we'll time the preparation to your arrival.</p>

                {items.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-line p-8 text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted" />
                    <p className="mt-3 text-sm font-semibold text-ink">No items in cart</p>
                    <p className="text-xs text-muted">Browse the menu to add food to your reservation.</p>
                    <Link to={`/restaurants/${selectedRestaurant.id}`}>
                      <Button variant="secondary" size="md" className="mt-4"><UtensilsCrossed className="h-4 w-4" /> Browse Menu</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-ivory p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">Cart Summary</p>
                      <div className="mt-2 space-y-2">
                        {items.map((item) => (
                          <div key={item.menuItemId} className="flex justify-between text-sm">
                            <span className="text-ink">{item.quantity}× {item.name}</span>
                            <span className="font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between border-t border-line pt-2">
                        <span className="font-bold text-ink">Total</span>
                        <span className="font-display text-lg font-bold text-primary-700">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="label-field">Preparation Option</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button onClick={() => setPrepOption('confirm_later')} className={cn('rounded-2xl border p-4 text-left transition-all', prepOption === 'confirm_later' ? 'border-primary-600 bg-primary-50' : 'border-line hover:border-primary-300')}>
                          <Timer className="h-5 w-5 text-primary-600" />
                          <p className="mt-2 text-sm font-bold text-ink">Confirm Later</p>
                          <p className="text-xs text-muted">Select food now, restaurant prepares when confirmed</p>
                        </button>
                        <button onClick={() => setPrepOption('prepare_on_arrival')} className={cn('rounded-2xl border p-4 text-left transition-all', prepOption === 'prepare_on_arrival' ? 'border-primary-600 bg-primary-50' : 'border-line hover:border-primary-300')}>
                          <ChefHat className="h-5 w-5 text-accent-500" />
                          <p className="mt-2 text-sm font-bold text-ink">Prepare on Arrival</p>
                          <p className="text-xs text-muted">Food timed to your arrival for freshness</p>
                        </button>
                      </div>
                    </div>

                    {prepOption === 'prepare_on_arrival' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-accent-50 p-4 border border-accent-100">
                        <div className="flex items-start gap-2">
                          <Bell className="mt-0.5 h-4 w-4 text-accent-600 shrink-0" />
                          <p className="text-xs text-ink">Your food will be prepared closer to your arrival to help maintain freshness and reduce waste.</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-surface px-4 py-2.5">
                          <div>
                            <p className="text-xs text-muted">Arrival: {formatTime(expectedArrival)}</p>
                            <p className="text-xs text-muted">Max prep: {maxPrepTime} min</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-muted">Recommended prep start</p>
                            <p className="font-display text-lg font-bold text-accent-600">{formatTime(recommendedPrepStart)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(4)}>Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Arrival */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Your arrival time</h2>
                <p className="text-sm text-muted">Tell us about your arrival so the kitchen can plan accordingly.</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: 'on_time', label: "I'm On Time", icon: Check, color: 'success' },
                    { id: 'en_route', label: '10 Min Away', icon: Navigation, color: 'primary' },
                    { id: 'running_late', label: 'Running Late', icon: Clock, color: 'warning' },
                    { id: 'arrived', label: 'I Have Arrived', icon: MapPin, color: 'accent' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setArrivalStatus(opt.id as any); if (opt.id !== 'running_late') setDelayMinutes(0); }}
                      className={cn('rounded-2xl border p-4 text-center transition-all', arrivalStatus === opt.id ? 'border-primary-600 bg-primary-50 shadow-soft' : 'border-line hover:border-primary-300')}
                    >
                      <opt.icon className={cn('mx-auto h-6 w-6', arrivalStatus === opt.id ? 'text-primary-600' : 'text-muted')} />
                      <p className="mt-2 text-xs font-bold text-ink">{opt.label}</p>
                    </button>
                  ))}
                </div>

                {arrivalStatus === 'running_late' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <p className="label-field">How late will you be?</p>
                    <div className="flex gap-2">
                      {[10, 15, 20, 30].map((m) => (
                        <button key={m} onClick={() => setDelayMinutes(m)} className={cn('rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all', delayMinutes === m ? 'border-warning bg-warning/10 text-warning' : 'border-line text-ink hover:border-warning')}>
                          +{m} min
                        </button>
                      ))}
                    </div>
                    {delayMinutes > 0 && (
                      <div className="rounded-xl bg-warning/10 p-4 border border-warning/20">
                        <p className="text-sm text-ink">
                          Updated arrival: <span className="font-bold text-warning">{formatTime(expectedArrival)}</span>
                        </p>
                        <p className="mt-1 text-xs text-muted">The restaurant will be notified and preparation will be adjusted.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Smart preparation timeline preview */}
                {items.length > 0 && prepOption === 'prepare_on_arrival' && (
                  <div className="rounded-xl border border-line bg-ivory p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Smart Preparation Timeline</p>
                    <div className="mt-4 space-y-3">
                      {[
                        { time: addMinutes(recommendedPrepStart, -10), label: 'Order confirmed', icon: Check, color: 'text-primary-600' },
                        { time: recommendedPrepStart, label: 'Preparation begins', icon: ChefHat, color: 'text-accent-500' },
                        { time: addMinutes(expectedArrival, -5), label: 'Food ready', icon: UtensilsCrossed, color: 'text-success' },
                        { time: expectedArrival, label: 'Customer arrival', icon: MapPin, color: 'text-primary-700' },
                      ].map((event, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-line">
                            <event.icon className={cn('h-4 w-4', event.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-ink">{event.label}</p>
                          </div>
                          <p className="text-sm font-bold text-ink">{formatTime(event.time)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setStep(5)}>Review & Confirm <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Review your reservation</h2>

                <div className="space-y-3">
                  <div className="rounded-xl bg-ivory p-4">
                    <div className="flex items-center gap-3">
                      <img src={selectedRestaurant.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-ink">{selectedRestaurant.name}</p>
                        <p className="text-xs text-muted">{selectedRestaurant.address}, {selectedRestaurant.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-bold uppercase text-muted">Date & Time</p>
                      <p className="mt-1 text-sm font-bold text-ink">{date}</p>
                      <p className="text-sm text-muted">{formatTime(time)}</p>
                    </div>
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-bold uppercase text-muted">Guests</p>
                      <p className="mt-1 text-sm font-bold text-ink">{guests} guests</p>
                      <p className="text-sm text-muted">{duration} min dining</p>
                    </div>
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-bold uppercase text-muted">Table</p>
                      <p className="mt-1 text-sm font-bold text-ink">{tables.find((t) => t.id === selectedTable)?.code}</p>
                      <p className="text-sm text-muted">{seatingAreas.find((a) => a.id === seatingArea)?.label}</p>
                    </div>
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-bold uppercase text-muted">Arrival</p>
                      <p className="mt-1 text-sm font-bold text-ink">{formatTime(expectedArrival)}</p>
                      <p className="text-sm text-muted">{arrivalStatus.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-bold uppercase text-muted">Pre-Order ({count} items)</p>
                      <div className="mt-2 space-y-1">
                        {items.map((item) => (
                          <div key={item.menuItemId} className="flex justify-between text-sm">
                            <span className="text-ink">{item.quantity}× {item.name}</span>
                            <span className="font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between border-t border-line pt-2">
                        <span className="font-bold text-ink">Total</span>
                        <span className="font-display text-base font-bold text-primary-700">{formatPrice(total)}</span>
                      </div>
                      {prepOption === 'prepare_on_arrival' && (
                        <p className="mt-2 text-xs text-accent-600">Food prep starts at {formatTime(recommendedPrepStart)}</p>
                      )}
                    </div>
                  )}

                  {selectedRestaurant.depositEnabled && (
                    <div className="rounded-xl bg-warning/10 p-4 border border-warning/20">
                      <p className="text-xs text-ink"><span className="font-bold">Deposit:</span> ₹{selectedRestaurant.depositAmount} (deducted from bill on arrival, refundable if cancelled 2+ hours before)</p>
                    </div>
                  )}

                  <div className="rounded-xl bg-ivory p-4">
                    <p className="text-xs font-bold uppercase text-muted">Cancellation Policy</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted">
                      <li>• Free cancellation up to 2 hours before</li>
                      <li>• Cancellation allowed before preparation begins</li>
                      <li>• After preparation starts, restaurant policy applies</li>
                      <li>• No-show: table released after {selectedRestaurant.gracePeriod} min grace period</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" onClick={() => setStep(4)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="accent" size="lg" fullWidth onClick={handleConfirm}>
                    <CheckCircle2 className="h-5 w-5" /> Confirm Reservation
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
