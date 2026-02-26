import { OpenCodeChat } from "@katalyst/chat";
import type { DomainModelFull } from "../../types/domain";

interface DDDChatProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

const DDD_SUGGESTIONS = [
  "What bounded contexts exist in this system?",
  "Help me identify the core domain",
  "What are the key domain events?",
  "Build a ubiquitous language glossary",
];

export function DDDChat({ model }: DDDChatProps) {
  return (
    <OpenCodeChat
      agentName="ddd-domain-mapper"
      model={{
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      }}
      accentColor="purple"
      title="Domain Discovery Chat"
      subtitle="Start a conversation to explore your domain. Ask about bounded contexts, aggregates, domain events, or paste code for analysis."
      suggestions={DDD_SUGGESTIONS}
      inputPlaceholder="Ask about your domain..."
      buildContextPreamble={() =>
        `[Context: You are helping map the domain model "${model.name}"${model.description ? ` — ${model.description}` : ""}.
DOMAIN_MODEL_ID: ${model.id}
Current state: ${model.boundedContexts.length} bounded contexts (${model.boundedContexts.map((c) => c.title).join(", ") || "none yet"}), ${model.aggregates.length} aggregates, ${model.domainEvents.length} domain events, ${model.glossaryTerms.length} glossary terms, ${(model.workflows ?? []).length} workflows.
IMPORTANT: Save all discovered artifacts to the API using curl with the DOMAIN_MODEL_ID above. Create bounded contexts first, then aggregates and events using the context IDs from the responses. Create workflows for key business process lifecycles.]

`
      }
      sessionTitle={`Domain Mapping: ${model.name}`}
      reinitTrigger={model.id}
    />
  );
}
