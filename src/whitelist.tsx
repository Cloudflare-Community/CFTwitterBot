import {
  CommandHandler,
  useDescription,
  createElement,
  Message,
  useString
} from "slshx";

export default function whitelist(): CommandHandler<Env> {
  useDescription("Whitelists a user for public posting.");
  const user = useString("user", "twitter user to be whitelisted", { required: true });
  return async (interaction, env) => {
    let username = "";
    if(/https:\/\/twitter.com\/[a-zA-Z0-9_]{1,15}/is.test(user)) username = user.split("/")[3];
    else if(/@[a-zA-Z0-9_]{1,15}/is.test(user)) username = user.slice(1);
    else if(/[a-zA-Z0-9_]{1,15}/is.test(user)) username = user;
    else return <Message ephemeral>❌This does not seem to be a valid Twitter user. Try again.❌</Message>;
    await env.KV.put(username.toLowerCase(), "verified");
    return <Message ephemeral>✅Twitter user `{username}` has been whitelisted!✅</Message>;
  };
}