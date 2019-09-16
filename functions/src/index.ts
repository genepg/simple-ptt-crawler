import * as functions from 'firebase-functions';
import * as cors from 'cors';
const corsHandler = cors({ origin: true });

import { PttCrawler } from './ptt/ptt-crawler'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const crawlPtt = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const crawler = new PttCrawler('beauty');
      
      crawler.setFilter({
        articleType: '[正妹]',
      })

      const data = await crawler.crawlByPosts(10, true)
      console.log('>>>>>>>', data)
      
      response.send(data)
    } catch (error) {
      console.log('error', error)
    }
  });
});
