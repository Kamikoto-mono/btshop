'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { Breadcrumbs, Eyebrow } from '@/components/ui'
import styles from './FaqView.module.scss'

interface IFaqQuestion {
  answer?: string
  answerRich?: ReactNode
  id: string
  question: string
}

interface IFaqSection {
  id: string
  title: string
  questions: IFaqQuestion[]
}

const legalLinks = {
  article226_1:
    'https://www.consultant.ru/document/cons_doc_LAW_10699/1f73e94c7dfdcefa44dbbc1b2799cf9c5331bee5/',
  article234:
    'https://www.consultant.ru/document/cons_doc_LAW_10699/deb8cd782c79ab8888215304186ca7e15ffb2fdc/',
  decree964:
    'https://www.consultant.ru/cons/cgi/online.cgi?base=LAW&dst=100010&n=74146&req=doc'
}

const faqSections: IFaqSection[] = [
  {
    id: 'general',
    title: 'Общие вопросы',
    questions: [
      {
        answer:
          'В каталоге представлены отдельные андрогенные и анаболические препараты, а также товары для послекурсовой терапии: антиэстрогены, ингибиторы ароматазы и средства для контроля пролактина.',
        id: 'what-can-buy',
        question: 'Что можно купить в магазине?'
      },
      {
        answer:
          'В линейке есть как заводские бренды, так и более доступные позиции от underground-производителей. Ассортимент регулярно обновляется, поэтому актуальное наличие и цены лучше смотреть прямо в каталоге.',
        id: 'brands',
        question: 'Какие бренды есть в ассортименте?'
      },
      {
        answer:
          'Товары закупаются напрямую у поставщиков и производителей без лишних посредников. Для оригинальных позиций проверку подлинности можно выполнить на официальном сайте производителя, если такая возможность предусмотрена брендом.',
        id: 'quality',
        question: 'Высокое ли качество препаратов?'
      },
      {
        answerRich: (
          <>
            <p>
              Вопрос законности зависит не только от самого вещества, но и от его состава,
              способа оборота и цели действий. Для ориентира можно смотреть действующие тексты
              нормативных актов.
            </p>

            <div className={styles.legalBlock}>
              <p className={styles.legalNoteTitle}>Тексты актов</p>
              <ul className={styles.legalLinks}>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.decree964}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Постановление Правительства РФ от 29.12.2007 № 964
                  </a>
                </li>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.article234}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Статья 234 УК РФ
                  </a>
                </li>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.article226_1}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Статья 226.1 УК РФ
                  </a>
                </li>
              </ul>
            </div>

            <p>
              Для практической оценки ситуации лучше опираться на актуальную редакцию норм и,
              если нужен персональный разбор, обращаться за юридической консультацией.
            </p>

            <div className={styles.legalBlock}>
              <p className={styles.legalNoteTitle}>Важно</p>
              <p>Этот блок носит справочный характер и не является юридической консультацией.</p>
            </div>
          </>
        ),
        id: 'legal-status',
        question: 'Стероиды легальны?'
      }
    ]
  },
  {
    id: 'delivery',
    title: 'Доставка',
    questions: [
      {
        answer:
          'Заказы отправляются по России. Доступный способ доставки указывается при оформлении заказа и зависит от текущих настроек магазина.',
        id: 'delivery-methods',
        question: 'Как осуществляется доставка?'
      },
      {
        answer:
          'Срок зависит от региона и работы перевозчика. Обычно доставка занимает от нескольких дней до пары недель, но точные сроки лучше уточнять по трек-номеру после отправки.',
        id: 'delivery-time',
        question: 'Как быстро я получу посылку?'
      },
      {
        answer:
          'Трек-номер передаётся после обработки заказа и передачи отправления в доставку. Обычно это происходит в течение нескольких дней после подтверждения оплаты.',
        id: 'track-number',
        question: 'Когда приходит трек-номер?'
      },
      {
        answer:
          'Да. После получения трек-номера можно проверить данные отправления в сервисе отслеживания выбранного перевозчика.',
        id: 'check-origin',
        question: 'Можно ли проверить отправление?'
      },
      {
        answerRich: (
          <>
            <p>
              Если интересует именно правовая часть, смотреть стоит не только условия доставки,
              но и действующие нормы, связанные с сильнодействующими веществами и незаконным
              перемещением через границу.
            </p>

            <div className={styles.legalBlock}>
              <p className={styles.legalNoteTitle}>Что посмотреть</p>
              <ul className={styles.legalLinks}>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.decree964}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Постановление Правительства РФ № 964
                  </a>
                </li>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.article234}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Статья 234 УК РФ
                  </a>
                </li>
                <li>
                  <a
                    className={styles.legalLink}
                    href={legalLinks.article226_1}
                    rel='noreferrer'
                    target='_blank'
                  >
                    Статья 226.1 УК РФ
                  </a>
                </li>
              </ul>
            </div>

            <p>
              Если нужен разбор конкретной ситуации, лучше сверять актуальную редакцию норм и
              консультироваться с профильным юристом.
            </p>
          </>
        ),
        id: 'delivery-law-note',
        question: 'Есть ли важные правовые ограничения по доставке?'
      }
    ]
  },
  {
    id: 'assortment',
    title: 'Ассортимент',
    questions: [
      {
        answer:
          'Ассортимент собран так, чтобы закрывать разные цели: набор массы, работа над рельефом, поддержка силовых показателей и восстановление после курса.',
        id: 'goals',
        question: 'Можно ли подобрать товары под разные задачи?'
      },
      {
        answer:
          'Да, в магазине есть отдельные категории препаратов для послекурсовой терапии, включая антиэстрогены и средства для контроля ароматазы и пролактина.',
        id: 'pct',
        question: 'Есть ли товары для ПКТ?'
      },
      {
        answer:
          'Инъекционные позиции вынесены в отдельный раздел каталога. Внутри товары разложены по группам и подкатегориям, чтобы быстрее найти нужное соединение и конкретный эфир.',
        id: 'injectable-products',
        question: 'Где найти инъекционные препараты?'
      }
    ]
  },
  {
    id: 'order',
    title: 'Оформление заказа',
    questions: [
      {
        answer:
          'Выберите нужные товары в каталоге, добавьте их в корзину, укажите контактные данные и адрес доставки, затем подтвердите заказ. После обработки с вами свяжутся для уточнения деталей.',
        id: 'how-to-order',
        question: 'Как оформить заказ?'
      },
      {
        answer:
          'Для оформления понадобятся ФИО, адрес доставки, почтовый индекс, телефон и при необходимости Telegram для связи по заказу.',
        id: 'required-fields',
        question: 'Какие данные нужны для оформления?'
      },
      {
        answer:
          'Процесс такой же, как и для других городов: добавьте товары в корзину, заполните данные получателя и подтвердите заказ.',
        id: 'order-from-moscow',
        question: 'Как получить заказ в Москве?'
      },
      {
        answer: 'Да. Минимальная сумма заказа составляет 5 000 рублей.',
        id: 'minimal-order',
        question: 'Есть ли минимальная сумма заказа?'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Оплата и скидки',
    questions: [
      {
        answer:
          'Нет. Магазин работает по полной предоплате и не отправляет заказы наложенным платежом.',
        id: 'payment-on-delivery',
        question: 'Можно ли оплатить заказ при получении?'
      },
      {
        answer:
          'Формат полной предоплаты используется как основной сценарий оформления заказа. Детали по оплате и подтверждению менеджер сообщает после обработки заявки.',
        id: 'why-prepayment',
        question: 'Почему нет оплаты наложенным платежом?'
      },
      {
        answer:
          'Да, для оптовых покупателей можно обсудить индивидуальные условия. Для расчёта скидки и деталей заказа лучше связаться с консультантом.',
        id: 'wholesale-discounts',
        question: 'Есть ли скидки для оптовых покупателей?'
      },
      {
        answer:
          'Да, на часть каталога могут действовать специальные цены. Актуальная стоимость и наличие отображаются в карточке товара.',
        id: 'regular-discounts',
        question: 'Бывают ли скидки на отдельные позиции?'
      }
    ]
  }
]

export const FaqView = () => {
  const initialSectionId = faqSections[0]?.id || ''
  const initialQuestionId = faqSections[0]?.questions[0]?.id || ''

  const [openedSectionId, setOpenedSectionId] = useState(initialSectionId)
  const [selectedQuestionId, setSelectedQuestionId] = useState(initialQuestionId)
  const [isMobile, setIsMobile] = useState(false)
  const [isDetailViewMobile, setIsDetailViewMobile] = useState(false)

  const selectedQuestion = useMemo(() => {
    if (!openedSectionId) {
      return null
    }

    const section = faqSections.find((item) => item.id === openedSectionId)

    if (!section) {
      return null
    }

    return section.questions.find((question) => question.id === selectedQuestionId) ?? section.questions[0] ?? null
  }, [openedSectionId, selectedQuestionId])

  const handleSectionToggle = (section: IFaqSection) => {
    const willCloseCurrent = openedSectionId === section.id

    setOpenedSectionId(willCloseCurrent ? '' : section.id)

    if (!willCloseCurrent) {
      setSelectedQuestionId(section.questions[0]?.id || '')
    }

    if (isMobile) {
      setIsDetailViewMobile(false)
    }
  }

  const scrollToTopMobile = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        behavior: 'smooth',
        top: 0
      })
    }
  }

  useEffect(() => {
    const updateMobile = () => {
      const mobile = typeof window !== 'undefined' ? window.innerWidth <= 800 : false

      setIsMobile(mobile)

      if (!mobile) {
        setIsDetailViewMobile(false)
      }
    }

    updateMobile()
    window.addEventListener('resize', updateMobile)

    return () => window.removeEventListener('resize', updateMobile)
  }, [])

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { href: '/', label: 'Главная' },
          { label: 'FAQ' }
        ]}
      />

      <section className={styles.sectionShell}>
        <div className={styles.header}>
          <Eyebrow className={styles.eyebrow} dot>
            FAQ
          </Eyebrow>
          <h1>Частые вопросы</h1>
        </div>

        <div className={styles.content}>
          <div
            className={`${styles.mobilePanels} ${
              isMobile && isDetailViewMobile ? styles.mobilePanelsDetail : ''
            }`}
          >
            <div className={styles.leftColumn}>
              {faqSections.map((section) => {
                const isOpened = section.id === openedSectionId

                return (
                  <div className={styles.faqSection} key={section.id}>
                    <button
                      className={`${styles.sectionHeader} ${
                        isOpened ? styles.sectionHeaderOpened : ''
                      }`}
                      onClick={() => handleSectionToggle(section)}
                      type='button'
                    >
                      <div className={styles.sectionHeaderLeft}>
                        <span className={styles.sectionIcon}>?</span>
                        <span className={styles.sectionTitle}>{section.title}</span>
                      </div>

                      <span
                        className={`${styles.sectionArrow} ${
                          isOpened ? styles.sectionArrowOpened : ''
                        }`}
                      >
                        ^
                      </span>
                    </button>

                    <div
                      className={`${styles.questionsList} ${
                        isOpened ? styles.questionsListOpened : ''
                      }`}
                    >
                      <div className={styles.questionsListInner}>
                        {section.questions.map((question) => {
                          const isSelected = question.id === selectedQuestionId

                          return (
                            <button
                              className={`${styles.questionItem} ${
                                isSelected ? styles.questionItemSelected : ''
                              }`}
                              key={question.id}
                              onClick={() => {
                                setSelectedQuestionId(question.id)

                                if (isMobile) {
                                  setIsDetailViewMobile(true)
                                  scrollToTopMobile()
                                }
                              }}
                              type='button'
                            >
                              {question.question}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.rightColumn}>
              {isMobile ? (
                <button
                  className={styles.backButton}
                  onClick={() => setIsDetailViewMobile(false)}
                  type='button'
                >
                  ← Назад
                </button>
              ) : null}

              {selectedQuestion ? (
                <div className={styles.answerCard}>
                  <h2>{selectedQuestion.question}</h2>
                  <div className={styles.answerText}>
                    {selectedQuestion.answerRich ? (
                      selectedQuestion.answerRich
                    ) : (
                      selectedQuestion.answer
                        ?.split('\n')
                        .map((line, index) => (
                          <p key={`${selectedQuestion.id}-${index}`}>{line}</p>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.answerCard}>
                  <h2>Выберите вопрос</h2>
                  <div className={styles.answerText}>
                    <p>Откройте раздел слева и выберите нужный пункт.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
