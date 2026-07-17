import { useMemo, useState } from 'react'
import type { PublicAvailability } from '../../models/Makeup'
import useLanguage from '../../hooks/use-language'

type Props = { slots: PublicAvailability[] }

export default function BookingCalendar({ slots }: Props) {
  const { language, t } = useLanguage()
  const dates = useMemo(() => [...new Set(slots.map(slot => slot.date))], [slots])
  const first = dates[0] || '2027-01-01'
  const [month, setMonth] = useState(Number(first.slice(5, 7)) - 1)
  const [selectedDate, setSelectedDate] = useState('')
  const slotDates = useMemo(() => new Set(dates), [dates])
  const availableDates = useMemo(() => new Set(slots.filter(slot => slot.status === 'AVAILABLE').map(slot => slot.date)), [slots])
  const cells = useMemo(() => {
    const start = new Date(Date.UTC(2027, month, 1))
    const offset = start.getUTCDay()
    const count = new Date(Date.UTC(2027, month + 1, 0)).getUTCDate()
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => `${2027}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`)] as Array<string | null>
  }, [month])
  const daySlots = slots.filter(slot => slot.date === selectedDate)
  const formatter = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(language === 'ar' ? 'ar-IL' : 'en-IL', options)

  return <div className="booking-calendar" role="group" aria-label={t('Bridal availability calendar', 'تقويم مواعيد العرائس')}>
    <div className="calendar-head">
      <button type="button" aria-label={t('Previous month', 'الشهر السابق')} disabled={month === 0} onClick={() => setMonth(month - 1)}>←</button>
      <strong>{formatter({ month: 'long', year: 'numeric' }).format(new Date(Date.UTC(2027, month, 1)))}</strong>
      <button type="button" aria-label={t('Next month', 'الشهر التالي')} disabled={month === 11} onClick={() => setMonth(month + 1)}>→</button>
    </div>
    <div className="calendar-week">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => <span key={day}>{formatter({ weekday: 'short' }).format(new Date(Date.UTC(2027, 0, 3 + index)))}</span>)}</div>
    <div className="calendar-grid">{cells.map((date, index) => {
      if (!date) return <span key={`empty-${index}`} />
      const sunday = new Date(`${date}T12:00:00Z`).getUTCDay() === 0
      const hasSlots = !sunday && slotDates.has(date)
      const available = hasSlots && availableDates.has(date)
      const visibleDate = formatter({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))
      return <button type="button" aria-label={`${visibleDate}: ${available ? t('available', 'متاح') : t('unavailable', 'غير متاح')}`} key={date} disabled={!hasSlots} className={`${selectedDate === date ? 'selected ' : ''}${available ? 'available' : 'unavailable'}`} onClick={() => setSelectedDate(date)}><bdi>{Number(date.slice(-2))}</bdi></button>
    })}</div>
    {selectedDate && <div className="calendar-slots">
      <h3>{formatter({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${selectedDate}T12:00:00`))}</h3>
      <div className="calendar-slots-list">{daySlots.map(slot => <div className={`availability-slot ${slot.status.toLowerCase()}`} key={`${slot.date}-${slot.startTime}`} aria-label={`${t('Appointment time', 'وقت الموعد')} ${slot.startTime}–${slot.endTime}: ${slot.status === 'AVAILABLE' ? t('available', 'متاح') : t('unavailable', 'غير متاح')}`}>
        <bdi>{slot.startTime}–{slot.endTime}</bdi>
        <small>{slot.status === 'AVAILABLE' ? t('Available', 'متاح') : t('Unavailable', 'غير متاح')}</small>
      </div>)}</div>
    </div>}
  </div>
}
