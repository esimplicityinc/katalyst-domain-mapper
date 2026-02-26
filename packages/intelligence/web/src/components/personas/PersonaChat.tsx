import { OpenCodeChat } from "@katalyst/chat";

interface PersonaChatProps {
  personaCount: number;
  storyCount: number;
  capabilityCount: number;
  onUpdated: () => void;
}

const PERSONA_SUGGESTIONS = [
  "Who are the key users of this system?",
  "Write user stories for the operator persona",
  "Identify gaps in persona coverage",
  "Help me write acceptance criteria",
];

export function PersonaChat(props: PersonaChatProps) {
  const { personaCount, storyCount, capabilityCount } = props;

  return (
    <OpenCodeChat
      agentName="persona-storyteller"
      model={{
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      }}
      accentColor="rose"
      title="Persona &amp; Story Chat"
      subtitle="Discover personas and write user stories with AI assistance"
      suggestions={PERSONA_SUGGESTIONS}
      inputPlaceholder="Ask about personas or user stories..."
      buildContextPreamble={() =>
        `[Context: You are helping manage personas and user stories.
Current state: ${personaCount} personas, ${storyCount} user stories, ${capabilityCount} capabilities available.
IMPORTANT: Use http://localhost:3001 as the base URL for all curl API calls.]

`
      }
      sessionTitle="Persona & Story Session"
    />
  );
}
