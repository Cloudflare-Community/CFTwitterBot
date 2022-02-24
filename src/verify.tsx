import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useString
} from "slshx";
import generateMessage from "./Twitter";

// `Env` contains bindings and is declared in types/env.d.ts
export default function verify(): CommandHandler<Env> {
  useDescription("Verifies tweets for public posting.");
  const tweet = useString("tweet", "tweet to be verified for announement", { required: true });
  return async function* (interaction, env) {
    yield;
    if(!/https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/g.test(tweet)) return <Message ephemeral>❌This does not seem to be a valid Tweet. Try again.❌</Message>;
    if(!(await env.KV.get(tweet.split("/")[3].toLowerCase()))) return <Message ephemeral>❌This Tweet was sent by a person who is not currently whitelisted. To add this user to the whitelist, use the `/whitelist` command.❌</Message>;
    const res = await fetch(`https://discord.com/api/v9/channels/${env.CHANNEL}/messages`, {headers:{authorization: `Bot ${env.TOKEN}`, "content-type": "application/json"}, method: "POST", body: JSON.stringify(await generateMessage(tweet))});
    console.log(res, await res.json());
    if(res.status !== 200) return <Message ephemeral>❌There was an error creating the announcement. Please try again later.❌</Message>;
    // const {id} = await res.json();
    // const crosspost = await fetch(`https://discord.com/api/v9/channels/${env.CHANNEL}/messages/${id}/crosspost`, {headers:{authorization: `Bot ${env.TOKEN}`, "content-type": "application/json"}, method: "POST"});
    // if(crosspost.status !== 200) return <Message ephemeral>❌There was an error cross-posting the announcement. Please try again later.❌</Message>;
    return <Message ephemeral>✅Tweet verified!✅</Message>;
  };
}