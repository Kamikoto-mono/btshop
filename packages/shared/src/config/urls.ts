export const API_BASE_URL = 'https://api.battletoads.shop/api'

export const SITE_URL = 'https://battletoads.shop/'
export const SITE_NAME = 'Battletoads Shop'

export const FRONT_ASSETS_BASE_URL =
  'https://battletoads.ams3.cdn.digitaloceanspaces.com/front-assets'

export const DEFAULT_OG_IMAGE_URL = `${FRONT_ASSETS_BASE_URL}/main-toads.png`

export const getFrontAssetUrl = (filename: string) =>
  `${FRONT_ASSETS_BASE_URL}/${filename}`

export const FRONT_ASSET_URLS = {
  btEmptyCard: getFrontAssetUrl('bt-empty-card.png'),
  dnaBlocks: getFrontAssetUrl('dna-blocks.png'),
  footerCellTextureTransparent: getFrontAssetUrl('footer-cell-texture-transparent.png'),
  mainToads: getFrontAssetUrl('main-toads.png'),
  molecule: getFrontAssetUrl('molecule.png')
} as const

export const TELEGRAM_OPERATOR_URL = 'https://t.me/btshop_operator'
export const TELEGRAM_CHAT_URL = 'https://t.me/btshop_chat'

export const YOUTUBE_ROGICH_URL = 'https://www.youtube.com/@rogi4bb'
export const YOUTUBE_VAST_URL = 'https://www.youtube.com/@Vast_os'

export const CRIMINAL_CODE_URL =
  'http://pravo.gov.ru/proxy/ips/?docbody=&link_id=0&nd=102041891&intelsearch=&firstDoc=1'
export const DECREE_964_URL =
  'https://roszdravnadzor.gov.ru/pages/reform/npa-archive/28-01-2021'
