import { useMemo, useState } from 'react'
import type { Availability } from '../../models/Makeup'
import useLanguage from '../../hooks/use-language'

type Props = { slots: Availability[]; value: string; onChange: (id: string) => void }
export default function BookingCalendar({ slots, value, onChange }: Props) {
  const { language, t } = useLanguage()
  const dates = useMemo(() => [...new Set(slots.map(slot => slot.date))], [slots])
  const first = dates[0] || '2027-01-01'
  const [month, setMonth] = useState(Number(first.slice(5, 7)) - 1)
  const [selectedDate, setSelectedDate] = useState('')
  const availableDates = new Set(slots.filter(slot => slot.isAvailable).map(slot => slot.date))
  const cells = useMemo(() => { const start = new Date(Date.UTC(2027, month, 1)); const offset = start.getUTCDay(); const count = new Date(Date.UTC(2027, month + 1, 0)).getUTCDate(); return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => `${2027}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`)] as Array<string | null> }, [month])
  const daySlots = slots.filter(slot => slot.date === selectedDate)
  const formatter = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(language === 'ar' ? 'ar-IL' : 'en-IL', options)
  return <div className="booking-calendar" role="group" aria-label={t('Appointment calendar','تقويم المواعيد')}><div className="calendar-head"><button type="button" aria-label={t('Previous month','الشهر السابق')} disabled={month === 0} onClick={() => setMonth(month - 1)}>←</button><strong>{formatter({ month: 'long', year: 'numeric' }).format(new Date(Date.UTC(2027, month, 1)))}</strong><button type="button" aria-label={t('Next month','الشهر التالي')} disabled={month === 11} onClick={() => setMonth(month + 1)}>→</button></div><div className="calendar-week">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,index)=><span key={day}>{formatter({weekday:'short'}).format(new Date(Date.UTC(2027,0,3+index)))}</span>)}</div><div className="calendar-grid">{cells.map((date,index) => { if (!date) return <span key={`empty-${index}`}/>; const sunday = new Date(`${date}T12:00:00Z`).getUTCDay() === 0; const enabled = !sunday && availableDates.has(date); const visibleDate=formatter({weekday:'long',day:'numeric',month:'long'}).format(new Date(`${date}T12:00:00`)); return <button type="button" aria-label={`${visibleDate}: ${enabled?t('available','متاح'):t('unavailable','غير متاح')}`} key={date} disabled={!enabled} className={selectedDate === date ? 'selected' : ''} onClick={() => { setSelectedDate(date); onChange('') }}><bdi>{Number(date.slice(-2))}</bdi></button> })}</div>{selectedDate && <div className="calendar-slots"><h3>{formatter({weekday:'long',day:'numeric',month:'long'}).format(new Date(`${selectedDate}T12:00:00`))}</h3>{daySlots.map(slot => <button type="button" aria-label={`${t('Appointment time','وقت الموعد')} ${slot.startTime}–${slot.endTime}: ${slot.isAvailable?t('available','متاح'):t('unavailable','غير متاح')}`} key={slot.id} disabled={!slot.isAvailable} className={value === String(slot.id) ? 'selected' : ''} onClick={() => onChange(String(slot.id))}><bdi>{slot.startTime}–{slot.endTime}</bdi><small>{slot.isAvailable ? t('Available','متاح') : t('Unavailable','غير متاح')}</small></button>)}</div>}</div>
}
