const express = require("express");
const app = express();
const { Cluster } = require("puppeteer-cluster");

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 4,
    monitor: false,
  });

  // Event handler to be called in case of problems
  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: data }) => {
    // console.info("Task in URL:" + data.url);
    // console.info("Task in FP:" + data.fullPage);
    const fp = data.fullPage == '1'? true:false;
    await page.goto(data.url);
    const path = "./exported/" + data.url.replace(/[^a-zA-Z]/g, "_") + ".png";
    const pageTitle = await page.evaluate(() => document.title);
    // console.log(`Page title is ${pageTitle}`);
    const screen = await page.screenshot({ path: path, fullPage: fp });
    // console.log(`Screenshot of ${data.url} saved: ${path}`);
    return screen;
  });

  // Extract title of page
  //   const extractTitle = async ({ page, data }) => {
  //     const { url, position } = data;
  //     await page.goto(url);
  //     const pageTitle = await page.evaluate(() => document.title);
  //     console.log(`Page title of #${position} ${url} is ${pageTitle}`);
  //   };

  // // Crawl the Google page
  // await cluster.task(async ({ page, data }) => {
  //     const { searchTerm, offset } = data;
  //     await page.goto(
  //         'https://www.google.com/search?q=' + searchTerm + '&start=' + offset,
  //         { waitUntil: 'domcontentloaded' }
  //     );

  //     console.log('Extracting Google results for offset=' + offset);

  //     // Extract the links and titles of the search result page
  //     (await page.evaluate(() => {
  //         return [...document.querySelectorAll('#ires .g .rc > .r a')]
  //             .map(el => ({ url: el.href, name: el.innerText }));
  //     })).forEach(({ url, name }, i) => {
  //         // Put them into the cluster queue with the task "extractTitle"
  //         console.log(`  Adding ${name} to queue`);
  //         cluster.queue({
  //             url,
  //             position: (offset + i+1)
  //         }, extractTitle);
  //     });
  // });

  // // cluster.queue({ searchTerm: 'puppeteer-cluster', offset: 0 });
  //     cluster.queue({ searchTerm: 'puppeteer-cluster', offset: 10 });

  //   cluster.queue("http://www.google.com");
  //   cluster.queue("http://www.wikipedia.org");
  // many more pages

  //   await cluster.idle();
  //   await cluster.close();

  // setup server
  app.get("/", async function (req, res) {
    if (!req.query.url) {
      const warning = "Please specify url like this: ?url=example.com";
      console.log(warning);
      return res.end(warning);
    }
    try {
    //   console.info("Request in URL:" + req.query.url);
    //   console.info("Request in FP:" + req.query.fullPage);
      const screen = await cluster.execute(req.query);

      // respond with image
      res.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Length": screen.length,
      });
      res.end(screen);
    } catch (err) {
      // catch error
      res.end("Error: " + err.message);
    }
  });

  app.listen(3000, function () {
    console.log("Screenshot server listening on port 3000.");
  });
})();
