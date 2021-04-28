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
          <h2 styleName="section-title">FAQ</h2>
          <Expandable
            title="Почему это работает?"
            content="Маркетмейкер зарабатывает на разности курсов при обслуживании покупки и продажи (спред)"
            onExpand={() => { feedback.marketmaking.faqOpened('Почему это работает?') }}
          />
          <Expandable
            title="Это безопасно?"
            content={
              <>
                <div>- Система находится в бета версии</div>
                <div>- Есть аудит от dsec</div>
                <div>- Рекомендуем инвестировать только те средства, которые не жалко потерять</div>
                <div>- Ключи от ваших средств находятся только у вас, мы не имеем доступа к вашим средствам</div>
                <div>- <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/RISKS.md" target="_blank">Уведомление о рисках</a></div>
              </>
            }
            onExpand={() => { feedback.marketmaking.faqOpened('Это безопасно?') }}
          />
          <Expandable
            title="Сколько я заработаю?"
            content={<div>Зависит от количества обменов и спреда. Но если обменов не будет, вы получите SWAP токены из расчета 10% APY. Для получения напишите в <a href="https://t.me/swaponlinebot" target="_blank">саппорт</a>.</div>}
            onExpand={() => { feedback.marketmaking.faqOpened('Сколько я заработаю?') }}
          />
          <Expandable
            title="Какой минимальный баланс нужен для начала?"
            content="(в разработке)"
            onExpand={() => { feedback.marketmaking.faqOpened('Какой минимальный баланс нужен для начала?') }}
          />
          <Expandable
            title="Какой минимальный срок маркетмейкинга?"
            content="Минимального срока нет, вы можете вывести средства в любой момент."
            onExpand={() => { feedback.marketmaking.faqOpened('Какой минимальный срок маркетмейкинга?') }}
          />
          <Expandable
            title="Как увеличить заработок?"
            content="Расскажите о возможности обмена в сообществах где вы состоите."
            onExpand={() => { feedback.marketmaking.faqOpened('Как увеличить заработок?') }}
          />
        </section>
      </div>
    )
  }

}

export default FAQ