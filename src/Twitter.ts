export default async function generateMessage(tweetLink: string){
  const tweet = new TweetFormatter(tweetLink);
  await new HTMLRewriter().on("meta", tweet).transform(await fetch(tweetLink)).arrayBuffer();
  const authorLink = `https://twitter.com/${tweet.username}`,
    extractor = new PfPExtractor();
  await new HTMLRewriter().on("img.ProfileAvatar-image" , extractor).transform(await fetch(`https://twitter.com/${tweet.username}`)).arrayBuffer();
  const ret : TweetMessage = {
    content: "",
    embeds: [{
      description: `${await msgFormat(tweet.description)}\n\n[**View Tweet**](${tweetLink})`,
      url: tweetLink,
      color: 15958048,
      author: {
        name: tweet.author,
        url: authorLink,
        icon_url: extractor.pfp
      },
      footer: {
        text: "From Twitter",
        icon_url: "https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc7275.png"
      },
      timestamp: new Date().toISOString()
    }]
  };
  if(tweet.image !== extractor.pfp) ret.embeds[0].image = {
    url: tweet.image
  };
  return ret;
}

class TweetFormatter {
  url: string;
  username: string;
  author: string;
  description: string;
  image: string;
  constructor(url: string) {
    this.url = url;
    this.username = url.split("/")[3];
    this.author = "";
    this.description = "";
    this.image = "";
  }
  element(e: Element) {
    switch(e.getAttribute("property")) {
      case "og:title":
        this.author = (e.getAttribute("content") as string).replace(" on Twitter", `(@${this.username})`);
        break;
      case "og:description":
        this.description = (e.getAttribute("content") as string).slice(1, -1);
        break;
      case "og:image":
        this.image = e.getAttribute("content") as string;
    }
  }
}

class DateExtractor {
  date: string;
  constructor() {
    this.date = "";
  }
  element(e: Element) {
    if(e.getAttribute("datetime")) this.date = e.getAttribute("datetime") as string;
  }
}

async function msgFormat(msg: string) {
  const tCos = [...msg.matchAll(/https:\/\/t.co\/[a-zA-Z0-9_]*/g)].map(e => e[0]);
  for(const link of tCos) msg = msg.replaceAll(link, await followRedirect(link));
  return msg.replaceAll("&#10;", "\n").replaceAll(/@[a-zA-Z0-9_]{1,15}/g, m => `[${m}](https://twitter.com/${m.substring(1)})`).replaceAll(/#[^ !@#$%^&*(),.?":{}|<>]*/g, m => `[${m}](https://twitter.com/hashtag${m.substring(1)})`).replaceAll(/https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)\/photo(s)?\/(\d+)/g, "");
} 

async function followRedirect(url: string) {
  const y = await fetch(url);
  const extractor = new TitleExtractor();
  await new HTMLRewriter().on("title", extractor).transform(y).arrayBuffer();
  return `[${y.url}](${y.url})`;
}

class TitleExtractor {
  title: string;
  constructor() {
    this.title = "";
  }
  text(t: Text) {
    if(t.lastInTextNode) return;
    this.title += t.text;
  }
}

class PfPExtractor {
  pfp: string;
  constructor() {
    this.pfp = "";
  }
  element(e: Element) {
    const t = e.getAttribute("src");
    if(t) this.pfp = t;
  }
}