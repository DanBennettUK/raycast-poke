Raycast Poke

A minimal Raycast extension for sending a message to Poke from Raycast.

Setup
- Add your Poke API key in Raycast preferences.
- Set the Poke base URL and endpoint paths if your deployment differs from the defaults.

Included commands
- Send Message: posts a message to Poke's inbound message endpoint.
- Check Replies: polls a configurable replies endpoint and displays any returned messages.

Replies / proactive replies
- I could not verify a documented push-based reply API from the available tools here.
- Best path is polling a read endpoint that returns replies for a conversation/thread.
- The scaffold includes a configurable polling command so the read side can be wired up later without changing the command UX.
- If Poke later exposes webhooks, server-sent events, or a subscription API, that would be the better path for proactive replies because it avoids polling.

Preferences
- apiKey: Poke API key
- baseUrl: Poke base URL
- inboundPath: inbound message path
- repliesPath: replies polling path
- defaultConversationId: optional conversation/thread id used by the replies command
