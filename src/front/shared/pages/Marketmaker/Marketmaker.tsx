import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './Marketmaker.scss'
import { feedback } from 'helpers'
import Expandable from 'components/ui/Expandable/Expandable'


@cssModules(styles, { allowMultiple: true })
export default class Marketmaker extends React.Component<null, null> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    //feedback.marketmaker.entered()
  }

  render() {
    return (
      <>
        <section styleName="how-to-earn">
          <h1>Как заработать на атомарных свопах?</h1>
          <p>Станьте маркетмейкером, предоставив свой капитал для обеспечения атомарных свопов.</p>
          <p>Когда пользователи будут совершать обмены, вы будете зарабатывать.</p>
        </section>
        <section styleName="select-mode">
          <h2>Выберите способ</h2>
          <div styleName="mode">
            <h3>Маркетмейкер в браузере</h3>
            <p>Подходит для того, что бы попробовать.</p>
            <p>Если вы закроете браузер, вы перестанете зарабатывать.</p>
            <button>Начать</button>
            {/*http://swaponline.io/#/mm*/}
          </div>
          <div styleName="mode">
            <h3>Маркетмейкер-сервер</h3>
            <p>Подходит для продвинутых пользователей.</p>
            <p>Требуется сервер для разворачивания образа Docker.</p>
            <button>Инструкция</button>
            {/*https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/MARKETMAKER.md*/}
          </div>
        </section>
        <section styleName="faq">
          <h2>FAQ</h2>
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
        <section styleName="marketmaker-settings">
  {/*        Маркетмейкинг BTC/WBTC : вкл/выкл
  Спред: 0.5% (по умолчанию стоит 0.5%)
  Баланс BTC: 2 BTC для пополнения переведите на `адрес битка`
  Баланс WBTC: 2 WBTC


  Маркетмейкеров онлайн: 10. Всего ордеров: 10 btc, 5 wbtc.*/}
        </section>
      </>
    )
  }

}
