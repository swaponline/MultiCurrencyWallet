import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './FAQ.scss'
import { feedback } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'


@cssModules(styles, { allowMultiple: true })
class FAQ extends React.Component<{isDark: boolean}, {}> {
  constructor(props) {
    super(props)
  }

  render() {
    const { isDark } = this.props

    return (
      <div styleName='mm-faq-page'>
        <section styleName={`${isDark ? 'dark' : '' }`}>
          <h2 styleName="section-title">
            <FormattedMessage
              id="MM_FAQ_Title"
              defaultMessage="FAQ"
            />
          </h2>
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle1"
                defaultMessage="Почему это работает?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent1"
                defaultMessage="Маркетмейкер зарабатывает на разности курсов при обслуживании покупки и продажи (спред)"
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Почему это работает?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle2"
                defaultMessage="Это безопасно?"
              />
            }
            content={
              <>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-1"
                    defaultMessage="- Система находится в бета версии"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-2"
                    defaultMessage="- Есть аудит от dsec"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-3"
                    defaultMessage="- Рекомендуем инвестировать только те средства, которые не жалко потерять"
                  />
                </div>
                <div>
                  <FormattedMessage
                    id="MM_FAQ_ItemBody2-4"
                    defaultMessage="- Ключи от ваших средств находятся только у вас, мы не имеем доступа к вашим средствам"
                  />
                </div>
                <div>
                  -
                  <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/RISKS.md" target="_blank">
                    <FormattedMessage
                      id="MM_FAQ_ItemBody2-5"
                      defaultMessage="Уведомление о рисках"
                    />
                  </a>
                </div>
              </>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Это безопасно?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle3"
                defaultMessage="Сколько я заработаю?"
              />
            }
            content={
              <div>
                <FormattedMessage
                  id="MM_FAQ_ItemContent3-1"
                  defaultMessage="Зависит от количества обменов и спреда. Но если обменов не будет, вы получите SWAP токены из расчета 10% APY. Для получения напишите в "
                />
                <a href="https://t.me/swaponlinebot" target="_blank">
                  <FormattedMessage
                    id="MM_FAQ_ItemContent3-2"
                    defaultMessage="caппорт."
                  />
                </a>
              </div>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Сколько я заработаю?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle4"
                defaultMessage="Какой минимальный баланс нужен для начала?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent4"
                defaultMessage="(в разработке)"
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Какой минимальный баланс нужен для начала?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle5"
                defaultMessage="Какой минимальный срок маркетмейкинга?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent5"
                defaultMessage="Минимального срока нет, вы можете вывести средства в любой момент."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Какой минимальный срок маркетмейкинга?') }}
          />
          <Expandable
            title={
              <FormattedMessage
                id="MM_FAQ_ItemTitle6"
                defaultMessage="Как увеличить заработок?"
              />
            }
            content={
              <FormattedMessage
                id="MM_FAQ_ItemContent6"
                defaultMessage="Расскажите о возможности обмена в сообществах где вы состоите."
              />
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Как увеличить заработок?') }}
          />
        </section>
      </div>
    )
  }

}

export default FAQ