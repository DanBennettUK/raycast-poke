Raycast Poke

A minimal Raycast extension for sending messages to Poke from Raycast.

Setup
- Add your Poke v2 API key in Raycast preferences.
- Keep the default base URL unless your deployment differs.
- The send command uses the documented inbound endpoint.

Included commands
- Send Message: posts a message to Poke's inbound message endpoint.
- Check Replies: polls a configurable replies endpoint and displays any returned messages.

Documented inbound endpoint
- POST https://poke.com/api/v1/inbound/api-message
- Authorization: Bearer YOUR_V2_API_KEY
- Content-Type: application/json
- Body: { "message": "..." }

Replies / proactive replies
- I did not find a documented push/webhook/SSE API for replies in the available workspace data.
- Best path is a polling read endpoint if Poke exposes one for conversations or threads.
- The scaffold includes a polling command and keeps the replies path configurable so a documented read endpoint can be wired in without changing the command shape.
- If Poke later exposes webhooks or a streaming API, that would be the better approach for proactive replies because it would avoid polling.

Preferences
- apiKey: Poke API key
- baseUrl: Poke base URL
- inboundPath: inbound message path, defaults to /api/v1/inbound/api-message
- repliesPath: replies polling path, if/when a read endpoint is available
- defaultConversationId: optional conversation/thread id used by the replies command
