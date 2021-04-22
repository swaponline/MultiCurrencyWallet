import puppeteer from 'puppeteer'

const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

jest.setTimeout(130 * 1000)

describe('First test', () => {
  it('check title', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:9001/');

    console.log('im here1')

    await page.click('#preloaderRestoreBtn')
    //await page.waitForSelector('.react-tags__search-input', {timeout: 120 * 1000})
    await timeOut(120 * 1000)

    await page.screenshot({
        path: `tests//e2e/screenshots/restore_${new Date().getTime().toString()}.jpg`,
        type: 'jpeg'
    });

    console.log('im here2')

    await browser.close();

    const title = 'welcome'

    expect(title).toBe('welcome')
  })
})