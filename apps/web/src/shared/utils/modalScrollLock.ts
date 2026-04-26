const LOCK_COUNT_KEY = 'modalLockCount'
const PREV_BODY_OVERFLOW_KEY = 'modalPrevBodyOverflow'
const PREV_HTML_OVERFLOW_KEY = 'modalPrevHtmlOverflow'
const PREV_BODY_POSITION_KEY = 'modalPrevBodyPosition'
const PREV_BODY_TOP_KEY = 'modalPrevBodyTop'
const PREV_BODY_WIDTH_KEY = 'modalPrevBodyWidth'
const SCROLL_Y_KEY = 'modalScrollY'

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return

  const html = document.documentElement
  const body = document.body
  const currentCount = Number(html.dataset[LOCK_COUNT_KEY] || '0')

  if (currentCount === 0) {
    const scrollY = window.scrollY || window.pageYOffset || 0

    html.dataset[SCROLL_Y_KEY] = String(scrollY)
    html.dataset[PREV_HTML_OVERFLOW_KEY] = html.style.overflow || ''
    html.style.overflow = 'hidden'

    body.dataset[PREV_BODY_OVERFLOW_KEY] = body.style.overflow || ''
    body.dataset[PREV_BODY_POSITION_KEY] = body.style.position || ''
    body.dataset[PREV_BODY_TOP_KEY] = body.style.top || ''
    body.dataset[PREV_BODY_WIDTH_KEY] = body.style.width || ''

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
  }

  html.dataset[LOCK_COUNT_KEY] = String(currentCount + 1)
}

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return

  const html = document.documentElement
  const body = document.body
  const currentCount = Number(html.dataset[LOCK_COUNT_KEY] || '0')

  if (currentCount <= 1) {
    const scrollY = Number(html.dataset[SCROLL_Y_KEY] || '0')

    const prevHtmlOverflow = html.dataset[PREV_HTML_OVERFLOW_KEY] || ''
    if (prevHtmlOverflow) {
      html.style.overflow = prevHtmlOverflow
    } else {
      html.style.removeProperty('overflow')
    }

    const prevBodyOverflow = body.dataset[PREV_BODY_OVERFLOW_KEY] || ''
    const prevBodyPosition = body.dataset[PREV_BODY_POSITION_KEY] || ''
    const prevBodyTop = body.dataset[PREV_BODY_TOP_KEY] || ''
    const prevBodyWidth = body.dataset[PREV_BODY_WIDTH_KEY] || ''

    if (prevBodyOverflow) {
      body.style.overflow = prevBodyOverflow
    } else {
      body.style.removeProperty('overflow')
    }

    if (prevBodyPosition) {
      body.style.position = prevBodyPosition
    } else {
      body.style.removeProperty('position')
    }

    if (prevBodyTop) {
      body.style.top = prevBodyTop
    } else {
      body.style.removeProperty('top')
    }

    if (prevBodyWidth) {
      body.style.width = prevBodyWidth
    } else {
      body.style.removeProperty('width')
    }

    delete html.dataset[LOCK_COUNT_KEY]
    delete html.dataset[SCROLL_Y_KEY]
    delete html.dataset[PREV_HTML_OVERFLOW_KEY]

    delete body.dataset[PREV_BODY_OVERFLOW_KEY]
    delete body.dataset[PREV_BODY_POSITION_KEY]
    delete body.dataset[PREV_BODY_TOP_KEY]
    delete body.dataset[PREV_BODY_WIDTH_KEY]

    window.scrollTo(0, scrollY)
    return
  }

  html.dataset[LOCK_COUNT_KEY] = String(currentCount - 1)
}
