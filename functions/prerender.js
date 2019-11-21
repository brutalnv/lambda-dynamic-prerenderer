const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context, callback) => {
	const ERROR_MESSAGE = 'No query parameter given!';
	const HEADERS = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Request-Method': 'POST'
	};

	if (event.queryStringParameters) {
		const targetUrl = event.queryStringParameters.url;

		// Failure
		if (!targetUrl) {
			callback(null, {
				statusCode: 400,
				headers: HEADERS,
				body: ERROR_MESSAGE
			});
		}

		const browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: chromium.headless
		});

		return new Promise(async (resolve, reject) => {
			let page = await browser.newPage();
			await page.goto(targetUrl, {
				waitUntil: 'networkidle0'
			});
			const result = await page.content();
			resolve(result);
		}).then(result => {
			console.log('result', result);
			browser.close();

			// Success
			callback(null, {
				statusCode: 200,
				headers: HEADERS,
				body: result
			});
		});
	} else {
		// Failure
		callback(null, {
			statusCode: 400,
			headers: HEADERS,
			body: ERROR_MESSAGE
		});
	}
};
