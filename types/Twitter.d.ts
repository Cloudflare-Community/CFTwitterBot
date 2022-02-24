declare type TweetMessage = {
  content: string;
  embeds: TweetEmbed[];
};

declare type TweetEmbed = {
  description: string;
  url: string;
  color: number;
  author: TweetAuthor;
  image?: TweetImage;
  footer: DiscordFooter;
  timestamp: string;
};

declare type TweetAuthor = {
  name: string;
  url: string;
  icon_url: string;
};

declare type TweetImage = {
  url: string;
};

declare type DiscordFooter = {
  text: string;
  icon_url: string;
};