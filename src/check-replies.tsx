import { List, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { normalizeReplies, pollPokeReplies, type PokePreferences, type PokeReply } from "./lib/poke";
import { useEffect, useState } from "react";

export default function Command() {
  const preferences = getPreferenceValues<PokePreferences>();
  const apiKey = preferences.apiKey?.trim();
  const baseUrl = preferences.baseUrl?.trim() || "https://poke.com";
  const repliesPath = preferences.repliesPath?.trim();
  const conversationId = preferences.defaultConversationId?.trim();

  const [replies, setReplies] = useState<PokeReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!apiKey || !conversationId || !repliesPath) {
        setIsLoading(false);
        return;
      }

      try {
        const payload = await pollPokeReplies({
          apiKey,
          baseUrl,
          repliesPath,
          conversationId,
        });
        const normalized = normalizeReplies(payload);
        setReplies(normalized.replies);
      } catch (error) {
        await showToast({ style: Toast.Style.Failure, title: "Could not load replies", message: error instanceof Error ? error.message : String(error) });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [apiKey, baseUrl, repliesPath, conversationId]);

  if (!apiKey) {
    return <List navigationTitle="Check Replies"><List.EmptyView title="Missing Poke API key" description="Add apiKey in Raycast preferences." /></List>;
  }

  if (!conversationId) {
    return <List navigationTitle="Check Replies"><List.EmptyView title="Missing conversation ID" description="Set defaultConversationId in Raycast preferences to enable polling." /></List>;
  }

  if (!repliesPath) {
    return <List navigationTitle="Check Replies"><List.EmptyView title="Missing replies endpoint" description="Set repliesPath in Raycast preferences once Poke's read API is confirmed." /></List>;
  }

  return (
    <List isLoading={isLoading} navigationTitle="Check Replies">
      {replies.map((reply) => (
        <List.Item
          key={reply.id}
          title={reply.text}
          subtitle={reply.author || reply.createdAt || "Reply"}
        />
      ))}
      {!isLoading && replies.length === 0 ? <List.EmptyView title="No replies found" description="The endpoint returned no messages." /> : null}
    </List>
  );
}
