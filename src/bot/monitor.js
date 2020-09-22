const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require("child_process");
var express = require('express');
var app = express();
var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

app.get('/secretmonitor_webcron', function (req, res) {
  (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent('robobot monitor');

  await page.goto('https://swaponline.github.io/#/usdt-btc');
  await page.waitFor(15000)
  
  const html = await page.content();
  
  if (html.match('<span style="color: gray;">sells</span>')) {
	  console.log(date+'orderbook founded ')
	  res.send(html)
  } else {
		  console.log(date+'no orderbook! go swapbot reboot') 
		  exec("pm2 restart swapbot", (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					res.send(`error: ${error.message}`);
					return;
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					res.send(`stderr: ${stderr}`);
					return;
				}
				console.log(date+'stdout: ${stdout}');
				res.send(`stdout: ${stdout}`);
		  });
	  }
	  
	  fs.writeFileSync("orderbook_tmp.html", html);
	  await browser.close();
	})(); 
});

app.listen(13012, function () {
  console.log('swapbot monitor agent app listening on port 3012!');
});
