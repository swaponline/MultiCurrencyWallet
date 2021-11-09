import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './SourceActions.scss'
import { Actions } from './types'

function SourceActions(props) {
  const { sourceAction, setAction } = props

  const actions = [
    {
      type: Actions.Swap,
      message: <FormattedMessage id="swap" defaultMessage="Swap" />,
    },
    {
      type: Actions.AddLiquidity,
      message: <FormattedMessage id="addLiquidity" defaultMessage="Add liquidity" />,
    },
  ]

  return (
    <div styleName="actionsWrapper">
      {actions.map((action) => {
        return (
          <label styleName="actionLabel">
            <input
              type="radio"
              name="sourceAction"
              defaultChecked={sourceAction === action.type}
              onChange={() => setAction(action.type)}
            />
            {action.message}
          </label>
        )
      })}
    </div>
  )
}

export default CSSModules(SourceActions, styles, { allowMultiple: true })
