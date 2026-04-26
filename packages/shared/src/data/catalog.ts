export interface IProduct {
  id: string
  name: string
  slug: string
  categorySlug: string
  categoryName: string
  compoundSlug: string
  compoundName: string
  lineSlug: string
  lineName: string
  brand: string
  dosage: string
  volume: string
  price: number
  stockLabel: string
  shortDescription: string
  description: string
  benefits: string[]
  faq: Array<{
    question: string
    answer: string
  }>
  images: string[]
}

export interface IProductLine {
  slug: string
  name: string
}

export interface ICompound {
  slug: string
  name: string
  lines: IProductLine[]
}

export interface ICategory {
  slug: string
  name: string
  compounds: ICompound[]
}

export const categories: ICategory[] = [
  {
    slug: 'injection',
    name: 'Инъекции',
    compounds: [
      {
        slug: 'testosterone',
        name: 'Тестостерон',
        lines: [
          {
            slug: 'testosterone-enanthate',
            name: 'Тестостерон энантат'
          },
          {
            slug: 'testosterone-propionate',
            name: 'Тестостерон пропионат'
          },
          {
            slug: 'testosterone-cypionate',
            name: 'Тестостерон ципионат'
          }
        ]
      },
      {
        slug: 'nandrolone',
        name: 'Нандролон',
        lines: [
          {
            slug: 'nandrolone-decanoate',
            name: 'Нандролон деканоат'
          },
          {
            slug: 'nandrolone-phenylpropionate',
            name: 'Нандролон фенилпропионат'
          }
        ]
      },
      {
        slug: 'trenbolone',
        name: 'Тренболон',
        lines: [
          {
            slug: 'trenbolone-acetate',
            name: 'Тренболон ацетат'
          },
          {
            slug: 'trenbolone-enanthate',
            name: 'Тренболон энантат'
          }
        ]
      }
    ]
  },
  {
    slug: 'oral',
    name: 'Оральные',
    compounds: [
      {
        slug: 'methandienone',
        name: 'Метандиенон',
        lines: [
          {
            slug: 'methandienone-10',
            name: 'Метандиенон 10 мг'
          }
        ]
      },
      {
        slug: 'oxandrolone',
        name: 'Оксандролон',
        lines: [
          {
            slug: 'oxandrolone-10',
            name: 'Оксандролон 10 мг'
          }
        ]
      }
    ]
  }
]

export const products: IProduct[] = [
  {
    id: 'te-001',
    name: 'Testosterone Enanthate 250',
    slug: 'testosterone-enanthate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'testosterone',
    compoundName: 'Тестостерон',
    lineSlug: 'testosterone-enanthate',
    lineName: 'Тестостерон энантат',
    brand: 'North Pharma',
    dosage: '250 мг/мл',
    volume: '10 мл',
    price: 2800,
    stockLabel: 'В наличии',
    shortDescription: 'Классический длинный эфир для базовых курсов и TRT-схем.',
    description:
      'Универсальный длинный эфир тестостерона для стабильного фона и прогнозируемой схемы приёма. Подходит для стартовых и массонаборных курсов.',
    benefits: [
      'Ровный гормональный фон при длинном эфире',
      'Подходит для базовых программ набора',
      'Удобная частота инъекций'
    ],
    faq: [
      {
        question: 'Для кого обычно выбирают энантат?',
        answer:
          'Чаще всего его выбирают для базовых курсов или длительных схем, когда важна стабильность уровня вещества.'
      },
      {
        question: 'Чем отличается от пропионата?',
        answer:
          'Энантат работает дольше, поэтому инъекции делают реже, а фон считается более плавным.'
      }
    ],
    images: ['Front label', 'Bottle', 'Packaging', 'Box side']
  },
  {
    id: 'te-002',
    name: 'Testosterone Enanthate 300',
    slug: 'testosterone-enanthate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'testosterone',
    compoundName: 'Тестостерон',
    lineSlug: 'testosterone-enanthate',
    lineName: 'Тестостерон энантат',
    brand: 'Polar Labs',
    dosage: '300 мг/мл',
    volume: '10 мл',
    price: 3150,
    stockLabel: 'В наличии',
    shortDescription: 'Более концентрированная версия энантата под опытные схемы.',
    description:
      'Повышенная концентрация энантата для тех, кому нужно сократить объём инъекции при сохранении общей дозировки.',
    benefits: [
      'Высокая концентрация в 1 мл',
      'Подходит для комбинированных схем',
      'Меньший объём инъекции'
    ],
    faq: [
      {
        question: 'Подходит ли новичкам?',
        answer:
          'Обычно для первого знакомства чаще выбирают классическую концентрацию, а 300 мг/мл берут под более точные схемы.'
      },
      {
        question: 'В чём плюс 300 мг/мл?',
        answer:
          'Основной плюс в том, что при той же суммарной дозировке можно использовать меньший объём раствора.'
      }
    ],
    images: ['Front label', 'Bottle', 'QR close-up', 'Packaging']
  },
  {
    id: 'tp-001',
    name: 'Testosterone Propionate 100',
    slug: 'testosterone-propionate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'testosterone',
    compoundName: 'Тестостерон',
    lineSlug: 'testosterone-propionate',
    lineName: 'Тестостерон пропионат',
    brand: 'North Pharma',
    dosage: '100 мг/мл',
    volume: '10 мл',
    price: 2550,
    stockLabel: 'В наличии',
    shortDescription: 'Короткий эфир с быстрым стартом и гибкой настройкой схемы.',
    description:
      'Пропионат выбирают в тех случаях, когда нужен более быстрый отклик и возможность точнее управлять схемой.',
    benefits: [
      'Быстрый старт действия',
      'Гибкость в настройке схемы',
      'Удобен для коротких циклов'
    ],
    faq: [
      {
        question: 'Чем пропионат отличается от энантата?',
        answer:
          'Пропионат относится к коротким эфирам и требует более частых инъекций.'
      },
      {
        question: 'Когда его обычно выбирают?',
        answer:
          'Когда нужна короткая схема, быстрый выход на рабочий фон или точная корректировка самочувствия.'
      }
    ],
    images: ['Front label', 'Bottle', 'Packaging', 'Lot sticker']
  },
  {
    id: 'tc-001',
    name: 'Testosterone Cypionate 250',
    slug: 'testosterone-cypionate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'testosterone',
    compoundName: 'Тестостерон',
    lineSlug: 'testosterone-cypionate',
    lineName: 'Тестостерон ципионат',
    brand: 'Atlas Labs',
    dosage: '250 мг/мл',
    volume: '10 мл',
    price: 2950,
    stockLabel: 'Мало на складе',
    shortDescription: 'Длинный эфир с мягким профилем и стабильной концентрацией.',
    description:
      'Ципионат часто рассматривают как альтернативу энантату, когда нужен сравнимый длинный профиль.',
    benefits: [
      'Длинный эфир',
      'Стабильная концентрация',
      'Хорошо подходит для длительных схем'
    ],
    faq: [
      {
        question: 'Есть ли большая разница с энантатом?',
        answer:
          'Практически оба относятся к длинным эфирам, но конкретный выбор обычно зависит от предпочтений и доступности.'
      },
      {
        question: 'Кому подойдёт?',
        answer:
          'Тем, кто хочет длинный эфир и спокойную рабочую схему без частых инъекций.'
      }
    ],
    images: ['Packaging', 'Bottle', 'Cap detail', 'Instruction']
  },
  {
    id: 'nd-001',
    name: 'Nandrolone Decanoate 250',
    slug: 'nandrolone-decanoate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'nandrolone',
    compoundName: 'Нандролон',
    lineSlug: 'nandrolone-decanoate',
    lineName: 'Нандролон деканоат',
    brand: 'Atlas Labs',
    dosage: '250 мг/мл',
    volume: '10 мл',
    price: 3400,
    stockLabel: 'В наличии',
    shortDescription: 'Длинный эфир нандролона для массонаборных и силовых схем.',
    description:
      'Популярная позиция в линейке длинных эфиров нандролона. Подходит для длительных циклов с размеренным фоном.',
    benefits: [
      'Длинный рабочий профиль',
      'Часто используется в наборных схемах',
      'Стабильная концентрация'
    ],
    faq: [
      {
        question: 'Для каких задач его обычно берут?',
        answer:
          'Чаще всего его выбирают под длительные силовые или массонаборные программы.'
      },
      {
        question: 'Это длинный эфир?',
        answer:
          'Да, деканоат относится к длинным эфирам и обычно используется в более спокойных схемах.'
      }
    ],
    images: ['Box', 'Bottle', 'Sticker', 'Packaging']
  },
  {
    id: 'np-001',
    name: 'Nandrolone Phenylpropionate 100',
    slug: 'nandrolone-phenylpropionate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'nandrolone',
    compoundName: 'Нандролон',
    lineSlug: 'nandrolone-phenylpropionate',
    lineName: 'Нандролон фенилпропионат',
    brand: 'Polar Labs',
    dosage: '100 мг/мл',
    volume: '10 мл',
    price: 3250,
    stockLabel: 'В наличии',
    shortDescription: 'Более короткая версия нандролона для гибких схем.',
    description:
      'Фенилпропионат берут в ситуациях, где нужен более управляемый профиль по сравнению с длинными эфирами.',
    benefits: [
      'Более гибкий контроль схемы',
      'Короткий эфир',
      'Удобен для комбинированных циклов'
    ],
    faq: [
      {
        question: 'В чём отличие от деканоата?',
        answer:
          'Фенилпропионат относится к более коротким эфирам, поэтому схема обычно строится иначе.'
      },
      {
        question: 'Когда он удобен?',
        answer:
          'Когда нужна более частая корректировка схемы и меньшее время выхода из курса.'
      }
    ],
    images: ['Box', 'Bottle', 'Front label', 'Seal']
  },
  {
    id: 'ta-001',
    name: 'Trenbolone Acetate 100',
    slug: 'trenbolone-acetate',
    categorySlug: 'injection',
    categoryName: 'Инъекции',
    compoundSlug: 'trenbolone',
    compoundName: 'Тренболон',
    lineSlug: 'trenbolone-acetate',
    lineName: 'Тренболон ацетат',
    brand: 'North Pharma',
    dosage: '100 мг/мл',
    volume: '10 мл',
    price: 3900,
    stockLabel: 'В наличии',
    shortDescription: 'Короткий эфир тренболона для точной настройки схемы.',
    description:
      'Ацетат используют в более гибких схемах, когда важна возможность быстро менять дозировку и отслеживать отклик.',
    benefits: [
      'Короткий эфир',
      'Быстрый контроль схемы',
      'Подходит для опытных пользователей'
    ],
    faq: [
      {
        question: 'Для кого подходит ацетат?',
        answer:
          'Обычно его выбирают пользователи с опытом, которым важна управляемость схемы.'
      },
      {
        question: 'Почему короткий эфир удобен?',
        answer:
          'Он позволяет быстрее корректировать частоту и объём инъекций.'
      }
    ],
    images: ['Front label', 'Bottle', 'Packaging', 'Cap']
  },
  {
    id: 'or-001',
    name: 'Methandienone 10',
    slug: 'methandienone-10',
    categorySlug: 'oral',
    categoryName: 'Оральные',
    compoundSlug: 'methandienone',
    compoundName: 'Метандиенон',
    lineSlug: 'methandienone-10',
    lineName: 'Метандиенон 10 мг',
    brand: 'North Pharma',
    dosage: '10 мг/таб',
    volume: '100 таб',
    price: 1900,
    stockLabel: 'В наличии',
    shortDescription: 'Классическая таблетированная позиция для набора.',
    description:
      'Таблетированная форма для тех, кто собирает короткие оральные схемы и ищет понятный формат приёма.',
    benefits: [
      'Удобный таблетированный формат',
      'Подходит для коротких циклов',
      'Понятная схема использования'
    ],
    faq: [
      {
        question: 'Почему выбирают таблетки?',
        answer:
          'Таблетки удобны тем, что не требуют инъекций и позволяют выстроить простой режим приёма.'
      },
      {
        question: 'Сколько таблеток в упаковке?',
        answer:
          'В этом mock-каталоге позиция идёт как 100 таблеток по 10 мг.'
      }
    ],
    images: ['Box', 'Tablets', 'Packaging', 'Back side']
  }
]

export const reviewItems = [
  {
    id: 'rv-001',
    author: 'Никита, Москва',
    rating: 5,
    text: 'Нормальная витрина, всё понятно по категориям и заказ удобно собрать с телефона.'
  },
  {
    id: 'rv-002',
    author: 'Илья, Самара',
    rating: 5,
    text: 'Понравилось, что есть FAQ и сразу видно эфиры по группам без мусора в карточке.'
  },
  {
    id: 'rv-003',
    author: 'Артём, Краснодар',
    rating: 4,
    text: 'Хорошая структура магазина, личный кабинет и адрес не надо каждый раз заново вбивать.'
  }
]

export const faqItems = [
  {
    id: 'faq-001',
    question: 'Это уже готовый backend?',
    answer:
      'Нет, текущая версия магазина собрана на мок-данных и нужна для визуальной и продуктовой наработки.'
  },
  {
    id: 'faq-002',
    question: 'Как оформляется заказ?',
    answer:
      'Пользователь добавляет товар в корзину, открывает модальное окно и заполняет ФИО, адрес, индекс и Telegram.'
  },
  {
    id: 'faq-003',
    question: 'Что сохраняется в личном кабинете?',
    answer:
      'Предпочтительный адрес и mock-история заказов для демонстрации будущего сценария после подключения backend.'
  }
]
