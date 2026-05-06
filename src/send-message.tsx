import { Action, ActionPanel, Form, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { sendPokeMessage, type PokePreferences } from "./lib/poke";

type Values = {
  message: string;
  conversationId?: string;
};

export default function Command() {
  const preferences = getPreferenceValues<PokePreferences>();
  const apiKey = preferences.apiKey?.trim();
  const baseUrl = preferences.baseUrl?.trim() || "https://poke.com";
  const inboundPath = preferences.inboundPath?.trim() || "/api/v1/inbound/api-message";

  async function handleSubmit(values: Values) {
    if (!apiKey) {
      await showToast({ style: Toast.Style.Failure, title: "Missing Poke API key" });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Sending message to Poke" });
    try {
      const result = await sendPokeMessage({
        apiKey,
        baseUrl,
        inboundPath,
        message: values.message,
        conversationId: values.conversationId?.trim() || undefined,
      });

      toast.style = Toast.Style.Success;
      toast.title = "Message sent";
      toast.message = typeof result === "string" ? result : "Poke accepted the message";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to send message";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  return (
    <Form navigationTitle="Send Message to Poke" actions={<ActionPanel><Action.SubmitForm title="Send" onSubmit={handleSubmit} /></ActionPanel>}>
      <Form.TextArea id="message" title="Message" placeholder="Type your message for Poke" info="Required" />
      <Form.TextField id="conversationId" title="Conversation ID" placeholder="Optional thread or conversation id" />
    </Form>
  );
}
