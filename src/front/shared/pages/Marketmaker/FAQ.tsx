import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './FAQ.scss'
import { feedback } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'


@cssModules(styles, { allowMultiple: true })
export default class FAQ extends React.Component<{}, {}> {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <section>
        <h2 styleName="section-title">FAQ</h2>
        <Expandable
          title="Почему это работает?"
          content="Маркетмейкер зарабатывает на разности курсов при обслуживании покупки и продажи (спред)"
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
        />
        <Expandable
          title="Сколько я заработаю?"
          content={<div>Зависит от количества обменов и спреда. Но если обменов не будет, вы получите SWAP токены из расчета 10% APY. Для получения напишите в <a href="https://t.me/swaponlinebot" target="_blank">саппорт</a>.</div>}
        />
        <Expandable
          title="Какой минимальный баланс нужен для начала?"
          content="(в разработке)"
        />
        <Expandable
          title="Какой минимальный срок маркетмейкинга?"
          content="Минимального срока нет, вы можете вывести средства в любой момент."
        />
        <Expandable
          title="Как увеличить заработок?"
          content="Расскажите о возможности обмена в сообществах где вы состоите."
        />
      </section>
    )
  }

}
