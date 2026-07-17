import { useEffect, useState } from 'react'
import type { ProtectedVideoPlayback } from '../../models/Makeup'
import useLanguage from '../../hooks/use-language'
import extractError from '../../services/extract-error'
import { getVideo } from '../../services/makeup-service'

type VdoCipherPlayerProps = {
  courseId: number
  lessonId: number
  lessonTitle: string
  onClose: () => void
}

export default function VdoCipherPlayer({ courseId, lessonId, lessonTitle, onClose }: VdoCipherPlayerProps) {
  const { language, t } = useLanguage()
  const [credentials, setCredentials] = useState<ProtectedVideoPlayback>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setCredentials(undefined)

    void getVideo(courseId, lessonId)
      .then(playback => { if (active) setCredentials(playback) })
      .catch(playbackError => { if (active) setError(extractError(playbackError, language)) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [courseId, lessonId, language, refreshKey])

  const playerUrl = credentials
    ? `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(credentials.otp)}&playbackInfo=${encodeURIComponent(credentials.playbackInfo)}`
    : ''

  return <aside className="vdocipher-player" aria-live="polite">
    <div className="video-player-heading">
      <div><p className="eyebrow">{t('Secure lesson playback', 'تشغيل الدرس الآمن')}</p><h2>{lessonTitle}</h2></div>
      <button type="button" className="button-secondary" onClick={onClose}>{t('Close player', 'إغلاق المشغّل')}</button>
    </div>
    {loading && <p className="video-player-state">{t('Preparing your secure video…', 'جارٍ تجهيز الفيديو الآمن…')}</p>}
    {!loading && error && <div className="video-player-error" role="alert"><p>{error}</p><button type="button" onClick={() => setRefreshKey(value => value + 1)}>{t('Try again', 'حاولي مرة أخرى')}</button></div>}
    {!loading && playerUrl && <>
      <div className="vdocipher-frame"><iframe src={playerUrl} title={`${t('Video lesson', 'درس فيديو')}: ${lessonTitle}`} allow="encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
      <button type="button" className="button-secondary refresh-playback" onClick={() => setRefreshKey(value => value + 1)}>{t('Refresh secure playback', 'تحديث التشغيل الآمن')}</button>
    </>}
  </aside>
}
