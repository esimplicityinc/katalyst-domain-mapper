import { OpenCodeChat } from "@katalyst/chat";

interface TaxonomyChatProps {
  snapshotId: string | null;
  nodeCount: number;
  capabilityCount: number;
  onUpdated: () => void;
}

const TAXONOMY_SUGGESTIONS = [
  "Help me define capabilities for my system",
  "Review my capability hierarchy for gaps",
  "Map capabilities to taxonomy nodes",
  "What capabilities am I missing?",
];

export function TaxonomyChat(props: TaxonomyChatProps) {
  const { snapshotId, nodeCount, capabilityCount } = props;

  return (
    <OpenCodeChat
      agentName="taxonomy-architect"
      model={{
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      }}
      accentColor="green"
      title="Taxonomy Architecture Chat"
      subtitle="Discover and refine your capability hierarchy with AI assistance"
      suggestions={TAXONOMY_SUGGESTIONS}
      inputPlaceholder="Ask about your taxonomy..."
      buildContextPreamble={() =>
        `[Context: You are helping manage the taxonomy architecture.
SNAPSHOT_ID: ${snapshotId ?? "none"}
Current state: ${nodeCount} taxonomy nodes, ${capabilityCount} capabilities.
IMPORTANT: Use http://localhost:3001 as the base URL for all curl API calls.]

`
      }
      sessionTitle="Taxonomy Architecture Session"
      reinitTrigger={snapshotId}
    />
  );
}
