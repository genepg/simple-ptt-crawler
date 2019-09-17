import { ResService } from '../res.service';
const resService = new ResService();

import { ParserService, PostInfo, PostDetail } from './parser';
const parserService = new ParserService();

export interface BoardFilterOptions {
  articleType?: string;
  aboveLikes?: number;
}

const OptionsCookieOver18 = {
  headers: {
    cookie: 'over18=1'
  }
};

export class PttCrawler {
  board = 'beauty';
  limitedPosts = 0;
  limitedPage = 0;
  scrapedArticles = 0;

  crawledPosts: PostInfo[] = [];
  imagesUrl: string[] = [];

  // filter options
  articleType: string | undefined;
  aboveLikes: number | undefined;

  constructor(board: string) {
    this.board = board;
  }

  private filterPosts(posts: PostInfo[]) {
    let filteredPosts = posts;
    if (this.articleType) {
      const postType = this.articleType;
      filteredPosts = posts.filter(post => post.title.startsWith(postType));
    }
    if (this.aboveLikes) {
      const aboveLikes = this.aboveLikes;
      filteredPosts = posts.filter(post => +post.likes >= aboveLikes);
    }
    return filteredPosts;
  }

  private async getPostsInPage(page: number): Promise<PostInfo[]> {
    const url = `https://www.ptt.cc/bbs/${this.board}/index${page}.html`;
    const document = await resService.fetchToDoc(url, OptionsCookieOver18);
    const posts = parserService.parseDocToPosts(document, this.articleType);
    const filteredPosts = this.filterPosts(posts);
    return filteredPosts;
  }

  private async getPostDetail(postUrl: string) {
    const document = await resService.fetchToDoc(postUrl);
    return parserService.parseDocToPostDetail(document);
  }

  private async getPostImages(postUrl: string) {
    console.log('postUrl', postUrl);
    const document = await resService.fetchToDoc(postUrl, OptionsCookieOver18);
    const imageLinks = parserService.parseDocToImages(document);
    return imageLinks;
  }

  // get images in posts
  private async getAllImagesInPosts(postLinks: string[]) {
    const imagesPM = postLinks.map(async link => {
      const postImages = await this.getPostImages(link);
      return postImages;
    });
    const images = await Promise.all(imagesPM);

    return images.flat();
  }

  private async getLatestPage() {
    const url = `https://www.ptt.cc/bbs/${this.board}/index.html`;
    const document = await resService.fetchToDoc(url, OptionsCookieOver18);
    const latestPage = parserService.parseDocToLatestPage(document);
    return latestPage;
  }

  private async crawlPostsByNumOfPost(page: number): Promise<PostInfo[]> {
    if (this.crawledPosts.length >= this.limitedPosts) {
      return this.crawledPosts.slice(0, this.limitedPosts);
    }

    const postsInPage = await this.getPostsInPage(page);
    this.crawledPosts.push(...postsInPage);
    const nextPage = page - 1;
    return this.crawlPostsByNumOfPost(nextPage);
  }

  private async crawlPostsByNumOfPage(page: number): Promise<PostInfo[]> {
    const pages = []
    for (let pageCount = 0; pageCount < this.limitedPage; pageCount++) {
      pages.push(page - pageCount)
    }
    const postsPM = pages.map(async (pageNum) => {
      const postsInPage = await this.getPostsInPage(pageNum);
      return postsInPage
    });

    const posts2D = await Promise.all(postsPM)
    const posts = posts2D.flat()

    return posts;
  }

  private getCrawlerData(postLinks: string[], onlyImages = false) {
    if (onlyImages) {
      return this.getAllImagesInPosts(postLinks);
    }

    const postsDetail: Promise<PostDetail>[] = postLinks.map(async link => {
      const postDetail = await this.getPostDetail(link);
      return postDetail;
    });

    return Promise.all(postsDetail);
  }

  // get posts by number of pages
  private async getPostsInfo(limitType: string) {
    const latestPage = await this.getLatestPage();
    if (!latestPage) {
      return;
    }
    let posts: PostInfo[] = []
    if (limitType === 'pages') {
      posts = await this.crawlPostsByNumOfPage(latestPage);
    }
    if (limitType === 'posts') {
      posts = await this.crawlPostsByNumOfPost(latestPage);
    }
    return posts
  }

  setFilter(filterOptions: BoardFilterOptions) {
    const { articleType, aboveLikes } = filterOptions;
    this.articleType = articleType;
    this.aboveLikes = aboveLikes;
  }

  // crawl from latest posts
  async crawlByPosts(maxPosts: number, onlyImages = false) {
    console.log('crawl posts >>>>')
    this.limitedPosts = maxPosts;

    const posts = await this.getPostsInfo('posts');
    if (!posts) {
      return;
    }
    const postLinks = posts.map(post => post.link);
    return this.getCrawlerData(postLinks, onlyImages)
  }

  // crawl from latest pages
  async crawlByPages(limitedPage: number, onlyImages = false) {
    console.log('crawl pages >>>>', limitedPage)
    this.limitedPage = limitedPage;

    const posts = await this.getPostsInfo('pages')
    if (!posts) {
      return;
    }
    const postLinks = posts.map(post => post.link);

    return this.getCrawlerData(postLinks, onlyImages)
  }
  // crawl by date
}
