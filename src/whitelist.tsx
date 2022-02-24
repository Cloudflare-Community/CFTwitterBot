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
    if(!/[a-zA-Z0-9_]{1,15}/g.test(user)) return <Message ephemeral>❌This does not seem to be a valid Twitter user. Try again.❌</Message>;
    await env.KV.put(user.toLowerCase(), "verified");
    return <Message ephemeral>✅Twitter user has been whitelisted!✅</Message>;
  };
}