import { useEffect, useState } from 'react'
export default function Intro() { const [visible, setVisible] = useState(true); useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 2100); return () => window.clearTimeout(timer) }, []); return visible ? <div className="brand-intro" aria-label="DOHA MUA"><img src="/assets/doha-mua-logo.png" alt="DOHA MUA" /></div> : null }
