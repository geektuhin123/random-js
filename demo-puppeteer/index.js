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


function generate_report_pdf() {
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

            // await page.setRequestInterception(true);
            // page.on('request', (request) => {
            //     if (request.resourceType() === 'document') {
            //         request.continue();
            //     } else {
            //         request.abort();
            //     }
            // });

            // opens the page in a new tab
            // Setting the waitUntil: ‘networkidle0’ option means that Puppeteer considers navigation to be finished when there are no network connections for at least 500 ms. (Check API docs for further information.)
            await page.goto('https://microsoft.github.io/PowerBI-JavaScript/demo/v2-demo/index.html', { waitUntil: 'networkidle2' });

            //#paginatedReportContainer > iframe
            const frames = await page.frames();
            // console.log("found frames", frames);
            // let iframe = frames.find(f => f.name() === 'iframeResult');
            let iframe = frames[1]
            console.log("frame result", iframe)

            //#dashboardLandingContainer > div > div
            // // wait for the selector to load
            // await page.waitForSelector('#dashboardLandingContainer > div > div');

            // declare a variable with an ElementHandle
            const element = await page.$('#dashboardContainer');

            await element.pdf({ path: 'report.pdf', format: 'A4' });
            // close browser
            await browser.close();
            //https://medium.com/datadriveninvestor/chirag-goel-changing-the-world-with-automation-31c7ba718555
            // we can click and wait for the page to load.
            // 
            // await page.click(FORM.BUTTON_SELECTOR);
            browser.close();

            //   // 1. Create PDF from URL
            //   await page.goto('https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pdf')
            //   await page.pdf({ path: 'api.pdf', format: 'A4' })

            //   // 2. Create PDF from static HTML
            //   const htmlContent = `<body>
            //   <h1>An example static HTML to PDF</h1>
            //   </body>`
            //   await page.setContent(htmlContent)
            //   await page.pdf({ path: 'html.pdf', format: 'A4' })

            // case 'pdf': {
            //     const format = searchParams.get('format') || null;
            //     const pageRanges = searchParams.get('pageRanges') || '';

            //     const pdf = await pTimeout(
            //       page.pdf({
            //         format,
            //         pageRanges,
            //       }),
            //       10 * 1000,
            //       'PDF timed out',
            //     );

            //     res.writeHead(200, {
            //       'content-type': 'application/pdf',
            //       'cache-control': 'public,max-age=31536000',
            //     });
            //     res.end(pdf, 'binary');
            //     break;
            //   }
            // // Generates a PDF with 'screen' media type.
            // await page.emulateMediaType('screen');
            // await page.pdf({ path: 'page.pdf' });
            return resolve([]);
        } catch (e) {
            return reject(e);
        }
    })
}

generate_report_pdf().then(console.log).catch(console.error);



 async function htmlToPdf (html, callback, options = null, puppeteerArgs=null, remoteContent=true) {
    if (typeof html !== 'string') {
        throw new Error(
            'Invalid Argument: HTML expected as type of string and received a value of a different type. Check your request body and request headers.'
        );
	}
	let browser;
	if (puppeteerArgs) {
		browser = await puppeteer.launch(puppeteerArgs);
	} else {
		browser = await puppeteer.launch();
	}

    const page = await browser.newPage();
    if (!options) {
        options = { format: 'Letter' };
    }

    if (remoteContent === true) {
        await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, {
            waitUntil: 'networkidle0'
        });
    } else {
        //page.setContent will be faster than page.goto if html is a static
        await page.setContent(html);
    }

    await page.pdf(options).then(callback, function(error) {
        console.log(error);
    });
    await browser.close();
};
