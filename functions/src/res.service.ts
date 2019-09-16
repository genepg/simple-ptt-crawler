import { JSDOM } from 'jsdom';
import fetch, { RequestInit } from 'node-fetch';

export class ResService {
  async fetchToDoc(url: string, opts?: RequestInit) {
    const res = await fetch(url, opts);
    const html = await res.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    return document;
  }
}
