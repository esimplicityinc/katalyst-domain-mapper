import { OpenCodeChat } from "@katalyst/chat";

interface UserTypeChatProps {
  userTypeCount: number;
  storyCount: number;
  capabilityCount: number;
  onUpdated: () => void;
}

const USER_TYPE_SUGGESTIONS = [
  "Who are the key users of this system?",
  "Write user stories for the operator user type",
  "Identify gaps in user type coverage",
  "Help me write acceptance criteria",
];

export function UserTypeChat(props: UserTypeChatProps) {
  const { userTypeCount, storyCount, capabilityCount } = props;

  return (
    <OpenCodeChat
      agentName="user-type-storyteller"
      model={{
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      }}
      accentColor="rose"
      title="User Type &amp; Story Chat"
      subtitle="Discover user types and write user stories with AI assistance"
      suggestions={USER_TYPE_SUGGESTIONS}
      inputPlaceholder="Ask about user types or user stories..."
      buildContextPreamble={() =>
        `[Context: You are helping manage user types and user stories.
Current state: ${userTypeCount} user types, ${storyCount} user stories, ${capabilityCount} capabilities available.
IMPORTANT: Use http://localhost:3001 as the base URL for all curl API calls.]

`
      }
      sessionTitle="User Type & Story Session"
    />
  );
}
