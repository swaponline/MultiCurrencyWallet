import React, { Component } from 'react'


import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import Title from 'components/PageHeadline/Title/Title'

@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

	handleStepEthToBtc = (step) => {
		  switch(step) {
		    case 1:
		      return <Title>1. Please wait. Confirmation processing</Title>;
		    case 2: 
		     	return <Title>2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it</Title>;
		    case 3:
		      return <Title>3. Bitcoin Script created and charged. Please check the information below</Title>;
		    case 4:
		      return <Title>4. Checking balance..</Title>;
		    case 5:
		      return <Title>5. Creating Ethereum Contract. Please wait, it will take a while</Title>;
		    case 6:
		      return <Title>6. Waiting BTC Owner adds Secret Key to ETH Contact</Title>;
		    case 7:
		      return <Title>7. Money was transferred to your wallet. Check the balance.</Title>;
		    case 8:
		      return <Title>Thank you for using Swap.Online!</Title>;
		    case 9:
		      return <Title>Thank you for using Swap.Online!</Title>;
		    default:
		      return null;
		  }
	}

	handleStepBtcToEth = (step) => {
		  switch(step) {
		    case 1:
		      return <Title>1. The order creator is offline. Waiting for him..</Title>;
		    case 2: 
		     	return <Title>2. Create a secret key</Title>;
		    case 3:
		      return <Title>3. Checking balance..</Title>;
		    case 4:
		      return <Title>4. Creating Bitcoin Script. Please wait, it will take a while</Title>;
		    case 5:
		      return <Title>5. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract</Title>;
		    case 6:
		      return <Title>6. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait</Title>;
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
    	const flowName = data.swap.flow._flowName;
    	let progress = Math.floor(100 / data.swap.flow.stepNumbers.finish * data.swap.flow.state.step)
    	console.log(data.swap.flow._flowName);
    	return (
    		<div styleName="overlay">
    	  		<div styleName="container">
	    	  		<div styleName="progress">
	    	  			<div styleName="bar" style={{ width: progress + '%'}}></div>
	    	  		</div>
	    	  		<span styleName="steps">{data.swap.flow.state.step} / {data.swap.flow.stepNumbers.end} steps</span>
	    	  		<span styleName="info">{flowName === 'ETH2BTC' ? this.handleStepEthToBtc(data.swap.flow.state.step) : this.handleStepBtcToEth(data.swap.flow.state.step)}</span>
    	  		</div>
    		</div>
    	)
  	}
}

