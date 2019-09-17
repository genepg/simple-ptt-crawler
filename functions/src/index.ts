import * as functions from 'firebase-functions';
import * as cors from 'cors';
const corsHandler = cors({ origin: true });

// import * as util from 'util';
import { PttCrawler } from './ptt/ptt-crawler'

export const crawlPttByPosts = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const crawler = new PttCrawler('beauty');
      crawler.setFilter({
        articleType: '[正妹]',
      })
      const data = await crawler.crawlByPosts(10, true)
      response.send(data)
    } catch (error) {
      console.log('error', error)
    }
  });
});

export const crawlPttByPages = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      // console.log(util.inspect(request.body))
      const crawler = new PttCrawler('beauty');
      crawler.setFilter({
        articleType: '[正妹]',
      })
      const data = await crawler.crawlByPages(2, true)
      response.send(data)
    } catch (error) {
      console.log('error', error)
    }
  });
});
