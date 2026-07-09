import { useEffect, useRef } from 'react'

const ADSENSE_CLIENT = 'ca-pub-8589809772144982'
const SCRIPT_ID = 'adsbygoogle-script'

// 콘텐츠가 있는 화면에 처음 진입했을 때만 애드센스 스크립트를 로드한다.
// 로그인 안내/이메일 인증 등 콘텐츠 없는 화면에서는 절대 로드하지 않는다.
export function useAdSense(enabled) {
  const injectedRef = useRef(false)

  useEffect(() => {
    if (!enabled || injectedRef.current) return
    injectedRef.current = true

    if (document.getElementById(SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [enabled])
}
