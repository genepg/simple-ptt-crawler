export interface PostDetail {
  title: string;
  content: string;
  // author: string,
}

export interface PostInfo {
  title: string;
  author: string;
  likes: string;
  link: string;
}

export class ParserService {
  private getPostInfo(element: Element) {
    const getTitle = () => {
      const ele: HTMLElementTagNameMap['div'] | null = element.querySelector(
        'div.title'
      );
      return ele && ele.textContent ? ele.textContent.trim() : '';
    };

    const getAuthor = () => {
      const ele: HTMLElementTagNameMap['div'] | null = element.querySelector(
        'div.meta div.author'
      );
      return ele && ele.textContent ? ele.textContent.trim() : '';
    };

    const getLikes = () => {
      const ele: HTMLElementTagNameMap['div'] | null = element.querySelector(
        'div.nrec'
      );
      return ele && ele.textContent ? ele.textContent.trim() : '';
    };

    const getLink = () => {
      const ele: HTMLElementTagNameMap['a'] | null = element.querySelector(
        'div.title a'
      );
      return ele ? `https://www.ptt.cc${ele.href.trim()}` : '';
    };

    return {
      title: getTitle(),
      author: getAuthor(),
      likes: getLikes(),
      link: getLink()
    };
  }

  parseDocToLatestPage(document: Document) {
    const element: HTMLElementTagNameMap['a'] | null = document.querySelector(
      '.btn-group-paging a:nth-of-type(2)'
    );
    if (!element) {
      return null;
    }
    const match = element.href.match(/bbs\/(?:.*)\/index([0-9]+)\.html/);
    if (!match) {
      return null;
    }
    const latestPageNum = Number(match[1]) + 1;

    return latestPageNum;
  }

  parseDocToPosts(document: Document, postType?: string) {
    const elements = document.querySelectorAll('.r-list-container > .r-ent');
    const posts: PostInfo[] = [];
    elements.forEach(element => {
      const postInfo = this.getPostInfo(element);
      posts.push(postInfo);
    });

    const filteredPosts = posts.filter(post => post.link.trim());
    return filteredPosts;
  }

  parseDocToPostDetail(document: Document): PostDetail {
    const postDetail = {
      title: 'Title',
      content: 'Content'
    };
    return postDetail;
  }

  parseDocToImages(document: Document) {
    const imgSelector =
      '#main-content a[href$=".jpg"],a[href$=".png"],a[href$=".gif"]';
    const anchors: NodeListOf<
      HTMLElementTagNameMap['a']
    > = document.querySelectorAll(imgSelector);
    console.log('anchors length', anchors.length);
    const imageLinks: string[] = [];

    anchors.forEach(anchor => {
      console.log('href', anchor.href);
      imageLinks.push(anchor.href);
    });

    return imageLinks;
  }
}
