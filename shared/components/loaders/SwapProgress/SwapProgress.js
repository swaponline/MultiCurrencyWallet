import React, { Component } from 'react'


import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import Title from 'components/PageHeadline/Title/Title'

@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

		handleStepEthToBtc = (step) => {
			  switch(step) {
			    case 1:
			      return <Title>Please wait. Confirmation processing</Title>;
			    case 2: 
			     	return <Title>2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it</Title>;
			    case 3:
			      return <Title>3. Bitcoin Script created and charged. Please check the information below</Title>;
			    case 4:
			      return <Title>Checking balance..</Title>;
			    case 5:
			      return <Title>4. Creating Ethereum Contract. Please wait, it will take a while</Title>;
			    case 6:
			      return <Title>5. Waiting BTC Owner adds Secret Key to ETH Contact</Title>;
			    case 7:
			      return <Title>7. Money was transferred to your wallet. Check the balance.</Title>;
			    case 8:
			      return <Title>Thank you for using Swap.Online!</Title>;
			    default:
			      return null;
			  }
		}

    render() {
    	const { data } = this.props;
    	let progress = Math.floor(100 / data.swap.flow.stepNumbers.finish * data.swap.flow.state.step)
    	return (
    		<div styleName="overlay">
    	  		<div styleName="container">
	    	  		<div styleName="progress">
	    	  			<div styleName="bar" style={{ width: progress}}></div>
	    	  		</div>
	    	  		<span styleName="steps">{data.swap.flow.state.step} / {data.swap.flow.stepNumbers.finish} steps</span>
	    	  		<span styleName="info">{this.handleStepEthToBtc(data.swap.flow.state.step)}</span>
    	  		</div>
    		</div>
    	)
  	}
}

