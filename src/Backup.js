addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a given request object
 * @param {Request} request
 */
async function handleRequest(request) {
  const tweetLink = "https://twitter.com/eastdakota/status/1496611276226584576";
  const tweet = new TweetFormatter(tweetLink);
  await new HTMLRewriter().on("meta", tweet).transform(await fetch(tweetLink)).arrayBuffer();
  return new Response(JSON.stringify({content:null,embeds:[await tweet.eject()]}));
}

class TweetFormatter {
  constructor(url) {
    this.username = url.split("/")[3];
    this.tweet = {
      url,
      author: {name:"",icon_url:"",url:`https://twitter.com/${this.username}`},
      description: "",
      image: {url:""},
      color: 15958048
    };
  }
  element(e) {
    switch(e.getAttribute("property")) {
      case "og:title":
        this.tweet.author.name = e.getAttribute("content").replace(" on Twitter", `(@${this.username})`);
        break;
      case "og:description":
        this.tweet.description = e.getAttribute("content").slice(1, -1);
        break;
      case "og:image":
        this.tweet.image.url = e.getAttribute("content");
    }
  }
  async msgFormat(msg) {
    const tCos = [...msg.matchAll(/https:\/\/t.co\/[a-zA-Z0-9_]*/g)].map(e => e[0]);
    console.log(tCos)
    for(const link of tCos) msg = msg.replaceAll(link, await followRedirect(link));
    return msg.replaceAll(/@[a-zA-Z0-9_]{1,15}/g, m=> `[${m}](https://twitter.com/${m.substring(1)})`).replaceAll(/https:\/\/t.co\/[a-zA-Z0-9_]*/g, async m => {
      console.log(await fetch(m));
      return m;
    });
  } 
  async eject() {
    const extractor = new PfPExtractor();
    await new HTMLRewriter().on("img.ProfileAvatar-image" , extractor).transform(await fetch(this.tweet.author.url)).arrayBuffer();
    this.tweet.author.icon_url = extractor.pfp;
    this.tweet.description = await this.msgFormat(this.tweet.description);
    return this.tweet;
  }
}

async function followRedirect(url) {
  const y = await fetch(url);
  const extractor = new TitleExtractor();
  await new HTMLRewriter().on("title", extractor).transform(y).arrayBuffer();
  return `[${y.url}](${y.url})`;
}

class TitleExtractor {
  text(t) {
    if(t.lastInTextNode) return;
    this.title += t.text;
  }
}

class PfPExtractor {
  constructor() {
    this.pfp = "";
  }
  element(e) {
    this.pfp = e.getAttribute("src");
  }
}