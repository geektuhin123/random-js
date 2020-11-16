const puppeteer = require('puppeteer');

function run() {
    return new Promise(async (resolve, reject) => {
        try {
            // const browser = await puppeteer.launch();
            // provides an optimised approach  
            // We can force Puppeteer to use a custom path for storing data like cookies and cache, 
            // which will be reused every time we run it again—until they expire or are manually deleted.
            const browser = await puppeteer.launch({
                userDataDir: './data',
            });
            const page = await browser.newPage();


            //we don’t really need to worry about any visuals,
            // including the images. We only care about bare HTML output, so let’s try to block every request.

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'document') {
                    request.continue();
                } else {
                    request.abort();
                }
            });

            // opens the page in a new tab
            // Setting the waitUntil: ‘networkidle0’ option means that Puppeteer considers navigation to be finished when there are no network connections for at least 500 ms. (Check API docs for further information.)
            await page.goto('https://visualbi.com/training/sap-analytics-cloud/', { waitUntil: 'networkidle2' });

            // fetch the training brochure.
            let urls = await page.evaluate(() => {
                let a = document.querySelector("#post-17735 > div > div.et_pb_section.et_pb_section_1.et_section_regular > div.et_pb_row.et_pb_row_0 > div.et_pb_column.et_pb_column_1_3.et_pb_column_1 > div > a").href;
                console.log("selector results", a);
                return [a];
            });

            // wait for the selector to load
            await page.waitForSelector('#role_based_training');
            // declare a variable with an ElementHandle
            const element = await page.$('#role_based_training');
            // take screenshot element in puppeteer
            await element.screenshot({ path: 'training.png' });
            // await element.pdf({ path: 'training.pdf', format: 'A4' });
            // close browser
            await browser.close();

            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

run().then(console.log).catch(console.error);