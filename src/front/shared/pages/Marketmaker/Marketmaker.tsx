import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './Marketmaker.scss'
import { feedback } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'


@cssModules(styles, { allowMultiple: true })
export default class Marketmaker extends React.Component<null, null> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    //feedback.marketmaker.entered()
  }

  onSelectBrowser() {
    //feedback.marketmaker.selected('browser')
  }

  onSelectServer() {
    //feedback.marketmaker.selected('server')
    window.open('https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/MARKETMAKER.md')
  }

  render() {
    return (
      <>
        <section styleName="how-to-earn">
          <h2 styleName="section-title">Как заработать на атомарных свопах?</h2>
          <p>Станьте маркетмейкером, предоставив свой капитал для обеспечения атомарных свопов.</p>
          <p>Когда пользователи будут совершать обмены, вы будете зарабатывать.</p>
        </section>
        <section styleName="select-mode">
          <h2 styleName="section-title">Выберите способ</h2>
          <div styleName="modes">
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">①</span> Маркетмейкер в браузере</h3>
              <p>Подходит для того, что бы попробовать.</p>
              <p>Если вы закроете браузер, вы перестанете зарабатывать.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectBrowser}>
                Начать в браузере
              </Button>
            </div>
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">②</span> Маркетмейкер-сервер</h3>
              <p>Подходит для продвинутых пользователей.</p>
              <p>Требуется сервер для разворачивания образа Docker.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectServer}>
                Настроить сервер
              </Button>
            </div>
          </div>
        </section>
        <section styleName="faq">
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
        <section styleName="marketmaker-settings">
          <h2 styleName="section-title">Настройки маркетмейкинга</h2>
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
