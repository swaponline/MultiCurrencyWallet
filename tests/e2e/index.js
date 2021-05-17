//ref https://github.com/johngrantuk/todoDapp/blob/fcf586a113b693bec9b2ae40ce1b358cda0b1fcf/client/src/App.test.js

//docker build tests/e2e -t pp1
//docker run --shm-size 1G --rm -v /root/e2e/app:/app pp1

const puppeteer = require("puppeteer")
const dappeteer = require("dappeteer")

async function run() {
	const browser = await dappeteer.launch(puppeteer,{
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	})
		
	const metamask = await dappeteer.getMetamask(browser)
		
	console.log(metamask)
	// create or import an account
	//await metamask.createAccount()
	await metamask.importPK('0x87a4e34fe562738085ad492a02f62774fb298efebb3bf3619e35ec0e7496f66b')

	// you can change the network if you want
	//console.log("swich to rinkeby")
	await metamask.switchNetwork('rinkeby')

	// go to a dapp and do something that prompts MetaMask to confirm a transaction
	const page = await browser.newPage()
	
	//const payButton = await page.$('#pay-with-eth')
	//await payButton.click()

	// 🏌
	//await metamask.confirmTransaction()
	
	await page.goto('https://ropsten.swaponline.io/');

	//1

		await page.waitFor(2000);
	await page.screenshot({path: '/app/screenshots/screenshot1.png'});
	console.log("click on Connect wallet "); 
	const [button] = await page.$x("//button[contains(., 'Connect')]");
	await button.click();
	/* TODO add catch, make screenshot with err descr */
	
	console.log("click on MetaMask ");
	await new Promise(r => setTimeout(r, 3000)); //TODO use waitFor instead
	const [button2] = await page.$x("//button[contains(., 'MetaMask')]");
	await button2.click();
	await page.waitFor(1000);
	
	await page.screenshot({path: '/app/screenshots/screenshot2.png'});
	
	await metamask.approve();
	await page.bringToFront();
	await page.waitFor(3000);
	
	await page.screenshot({path: '/app/screenshots/screenshot3.png', fullPage: true});

	await browser.close();
}


run()
