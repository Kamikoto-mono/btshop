'use client'

import { useEffect, useMemo, useState } from 'react'

import { Breadcrumbs, StatusDot } from '@/components/ui'
import styles from './FaqView.module.scss'

interface IFaqQuestion {
  id: string
  question: string
  answer: string
}

interface IFaqSection {
  id: string
  title: string
  questions: IFaqQuestion[]
}

const faqSections: IFaqSection[] = [
  {
    id: 'general',
    title: 'Общие вопросы',
    questions: [
      {
        id: 'what-can-buy',
        question: 'Что можно купить в магазине?',
        answer:
          'В каталоге представлены отдельные андрогенные и анаболические препараты, а также товары для послекурсовой терапии: антиэстрогены, ингибиторы ароматазы и препараты для контроля пролактина.'
      },
      {
        id: 'brands',
        question: 'Какие бренды есть в ассортименте?',
        answer:
          'В линейке есть как заводские бренды, так и более доступные позиции от underground-производителей. Часть товаров закупается напрямую у производителей, поэтому ассортимент регулярно обновляется, а цены остаются конкурентными.'
      },
      {
        id: 'quality',
        question: 'Высоко ли качество препаратов?',
        answer:
          'Товары закупаются напрямую у поставщиков и производителей без лишних посредников. Для оригинальных позиций проверку подлинности можно выполнить на официальном сайте производителя, если такая возможность предусмотрена брендом.'
      }
    ]
  },
  {
    id: 'delivery',
    title: 'Доставка',
    questions: [
      {
        id: 'delivery-methods',
        question: 'Как осуществляется доставка?',
        answer:
          'Заказы отправляются Почтой России. Для отдельных направлений может быть доступна курьерская доставка EMS. Все отправления формируются с территории РФ.'
      },
      {
        id: 'delivery-time',
        question: 'Как быстро я получу посылку?',
        answer:
          'Срок зависит от региона и работы службы доставки. В среднем посылка может идти до адресата от 4 до 21 дня.'
      },
      {
        id: 'track-number',
        question: 'Когда приходит трек-номер?',
        answer:
          'Трек-номер передается после обработки заказа и передачи посылки в доставку. Обычно это занимает несколько дней после подтверждения оплаты.'
      },
      {
        id: 'check-origin',
        question: 'Можно ли проверить страну отправления?',
        answer:
          'Да. После получения трек-номера вы сможете проверить информацию об отправлении в сервисе отслеживания перевозчика.'
      }
    ]
  },
  {
    id: 'assortment',
    title: 'Ассортимент',
    questions: [
      {
        id: 'goals',
        question: 'Можно ли подобрать товары под разные задачи?',
        answer:
          'Ассортимент собран так, чтобы закрывать разные цели: набор массы, работа над рельефом, поддержка силовых показателей и восстановление после курса. В каталоге есть тестостерон, метандростенолон, туринабол, станозолол, оксандролон, тренболон и другие позиции.'
      },
      {
        id: 'pct',
        question: 'Есть ли товары для ПКТ?',
        answer:
          'Да, в магазине есть отдельные категории препаратов для послекурсовой терапии, включая антиэстрогены и средства для контроля ароматазы и пролактина.'
      },
      {
        id: 'injectable-products',
        question: 'Где найти инъекционные препараты?',
        answer:
          'Инъекционные позиции вынесены в отдельный раздел каталога. Внутри него товары разложены по группам и подкатегориям, чтобы быстрее найти нужное соединение и конкретный эфир.'
      }
    ]
  },
  {
    id: 'order',
    title: 'Оформление заказа',
    questions: [
      {
        id: 'how-to-order',
        question: 'Как оформить заказ?',
        answer:
          'Выберите нужные товары в каталоге, добавьте их в корзину, укажите контактные данные и адрес доставки, затем подтвердите заказ. После обработки с вами свяжутся для уточнения деталей.'
      },
      {
        id: 'required-fields',
        question: 'Какие данные нужны для оформления?',
        answer:
          'Для оформления понадобятся ФИО, адрес доставки, почтовый индекс и Telegram для связи по заказу.'
      },
      {
        id: 'order-from-moscow',
        question: 'Как получить заказ в Москве?',
        answer:
          'Процесс такой же, как и для других городов: добавьте товары в корзину, заполните данные получателя и подтвердите заказ. Отправка выполняется с территории России.'
      },
      {
        id: 'minimal-order',
        question: 'Есть ли минимальная сумма заказа?',
        answer: 'Да. Минимальная сумма заказа составляет 5 000 рублей.'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Оплата и скидки',
    questions: [
      {
        id: 'payment-on-delivery',
        question: 'Можно ли оплатить заказ при получении?',
        answer:
          'Нет. Магазин работает только по полной предоплате и не отправляет заказы наложенным платежом.'
      },
      {
        id: 'why-prepayment',
        question: 'Почему нет оплаты наложенным платежом?',
        answer:
          'Наложенный платеж не дает покупателю реальной защиты: данные получателя все равно указываются заранее, а оплату нужно внести до фактической проверки содержимого посылки. Поэтому используется формат полной предоплаты и дальнейшей отправки заказа.'
      },
      {
        id: 'wholesale-discounts',
        question: 'Есть ли скидки для оптовых покупателей?',
        answer:
          'Да, для оптовых покупателей можно обсудить индивидуальные условия. Для расчета скидки и деталей заказа свяжитесь с консультантом.'
      },
      {
        id: 'regular-discounts',
        question: 'Бывают ли скидки на отдельные позиции?',
        answer:
          'Да, на часть каталога могут действовать специальные цены. Актуальная стоимость и наличие отображаются в карточке товара.'
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

    return (
      section.questions.find((question) => question.id === selectedQuestionId) ??
      section.questions[0] ??
      null
    )
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
        top: 0,
        behavior: 'smooth'
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
          <p className={styles.eyebrow}>
            <StatusDot />
            FAQ
          </p>
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
                    {selectedQuestion.answer.split('\n').map((line, index) => (
                      <p key={`${selectedQuestion.id}-${index}`}>{line}</p>
                    ))}
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
