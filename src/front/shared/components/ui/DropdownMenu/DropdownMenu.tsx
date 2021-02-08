import React, { Component } from 'react';
import classNames from 'classnames';
import shortid from 'shortid';
import { constants } from 'helpers'
import cssModules from 'react-css-modules'
import dots from './images/dots.svg'
import greyDots from './images/greyDots.svg'
import styles from './DropdownMenu.scss'

type Props = {
	className: string
	size: string
	items: {
		action: () => void
		title: JSX.Element
		disabled?: boolean
		hidden?: boolean
		id: number
	}[]
}

const isDark = localStorage.getItem(constants.localStorage.isDark)
@cssModules(styles, { allowMultiple: true })
export default class DropdownMenu extends Component<Props, any> {

	dropdownMenu: any

	constructor(props) {
		super(props);

		this.state = {
			open: false,
		}

		this.dropdownMenu = React.createRef();
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleAnyClick, false);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleAnyClick, false);
	}

	handleAnyClick = (e) => {
		if (!this.dropdownMenu.current.contains(e.target)) {
			this.setState({
				open: false
			});
		}
	}

	handleClick = () => {
		const { open } = this.state;

		this.setState({
			open: !open
		});
	}

	handleItemClick = (action) => {
		this.setState({
			open: false
		});

		action();
	}

	render() {
		const { items, className, size } = this.props;
		const { open } = this.state;

		return (
			<div styleName={classNames('dropdownMenu', size)} ref={this.dropdownMenu}>
				<button type="button" onClick={this.handleClick} className="data-tut-row-menu">
					<img src={isDark ? greyDots : dots} />
				</button>
				<div styleName={`${classNames('menu', className, { open })} ${isDark ? '--dark' : ''}`}>
					{
						items.map((item, index) => item.hidden ? null : (
							<div key={index} styleName="dropdownMenuItem">
								<button 
									disabled={item.disabled}
									key={shortid.generate()}
									type="button"
									onClick={() => this.handleItemClick(item.action)}
								>
									{item.title}
								</button>
							</div>
						))
					}
				</div>
			</div>
		);
	}
}

