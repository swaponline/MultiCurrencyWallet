import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './Marketmaker.scss'
import { feedback } from 'helpers'


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
  {/*        ## Почему это работает?
  Маркетмейкер зарабатывает на разности курсов при обслуживании покупки и продажи (спред)

  ## Это безопасно?
  - Система находится в бета версии
  - Есть аудит от dsec
  - Рекомендуем инвестировать только те средства, которые не жалко потерять
  - Ключи от ваших средств находятся только у вас, мы не имеем доступа к вашим средствам
  - Уведомления о рисках https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/RISKS.md

  ## Сколько % я заработаю?
  - Зависит от количества обменов и спреда. Но если обменов не будет, вы получите SWAP токены из расчета 10% APY. Для получения напишите в саппорт https://t.me/swaponlinebot.

  ## Какая минимальный баланс для начала?
  - (в разработке)

  ## Какой минимальный срок маркетмейкинга?
  - Минимального срока нет, вы можете вывести средства в любой момент.

  ## Как увеличить заработок?
  - Расскажите о возможности обмена в сообществах где вы состоите.*/}
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
