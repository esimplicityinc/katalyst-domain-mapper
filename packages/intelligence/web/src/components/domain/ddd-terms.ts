/** Definition entry for a DDD term shown in explainer tooltips. */
export interface DDDTermDefinition {
  term: string;
  definition: string;
  learnMore?: string;
}

/**
 * Static dictionary of ~20 DDD terms mapped to plain-English definitions.
 *
 * Keys are kebab-case slugs that match how `<DDDTooltip termKey="..." />`
 * references each term.
 */
export const DDD_TERMS: Record<string, DDDTermDefinition> = {
  "bounded-context": {
    term: "Bounded Context",
    definition:
      "A clear boundary within which a particular domain model applies. Each context has its own language, rules, and models — even if terms overlap with other contexts.",
    learnMore: "https://martinfowler.com/bliki/BoundedContext.html",
  },
  aggregate: {
    term: "Aggregate",
    definition:
      "A cluster of related objects treated as a single unit for data changes. All modifications go through the aggregate root, which enforces consistency rules.",
    learnMore: "https://martinfowler.com/bliki/DDD_Aggregate.html",
  },
  "aggregate-root": {
    term: "Aggregate Root",
    definition:
      "The single entity that acts as the gateway to its aggregate. External code can only reference the root — never the internal objects directly.",
  },
  entity: {
    term: "Entity",
    definition:
      "An object defined primarily by its identity rather than its attributes. Two entities with the same data but different IDs are different objects.",
    learnMore: "https://martinfowler.com/bliki/EvansClassification.html",
  },
  "value-object": {
    term: "Value Object",
    definition:
      "An immutable object defined entirely by its attributes, with no unique identity. Two value objects with identical fields are considered equal.",
    learnMore: "https://martinfowler.com/bliki/ValueObject.html",
  },
  "domain-event": {
    term: "Domain Event",
    definition:
      "A record of something meaningful that happened in the domain. Events capture past facts and are used to communicate changes across boundaries.",
    learnMore: "https://martinfowler.com/eaaDev/DomainEvent.html",
  },
  "ubiquitous-language": {
    term: "Ubiquitous Language",
    definition:
      "A shared vocabulary between developers and domain experts, used consistently in code, conversations, and documentation within a bounded context.",
    learnMore: "https://martinfowler.com/bliki/UbiquitousLanguage.html",
  },
  "context-map": {
    term: "Context Map",
    definition:
      "A visual overview of all bounded contexts in a system and the relationships between them. It reveals integration patterns and team dependencies.",
    learnMore:
      "https://www.infoq.com/articles/ddd-contextmapping/",
  },
  upstream: {
    term: "Upstream / Downstream",
    definition:
      "Describes the direction of influence between two contexts. The upstream context provides data or services; the downstream context consumes them.",
  },
  "anti-corruption-layer": {
    term: "Anti-Corruption Layer (ACL)",
    definition:
      "A translation layer that prevents one context's model from leaking into another. It isolates your domain from external or legacy models.",
    learnMore:
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer",
  },
  "customer-supplier": {
    term: "Customer-Supplier",
    definition:
      "A relationship where the downstream team (customer) negotiates requirements with the upstream team (supplier), who plans accordingly.",
  },
  conformist: {
    term: "Conformist",
    definition:
      "A relationship where the downstream context adopts the upstream context's model as-is, with no translation. Used when the upstream team has no incentive to accommodate downstream needs.",
  },
  "shared-kernel": {
    term: "Shared Kernel",
    definition:
      "A small, explicitly shared subset of a domain model that two contexts agree to maintain together. Changes require coordination between both teams.",
  },
  partnership: {
    term: "Partnership",
    definition:
      "A relationship where two contexts cooperate closely, evolving their models together. Failures in one affect the other, so teams coordinate tightly.",
  },
  "core-subdomain": {
    term: "Core Subdomain",
    definition:
      "The part of the domain that provides the greatest competitive advantage. It deserves the highest investment in design quality and talent.",
  },
  "supporting-subdomain": {
    term: "Supporting Subdomain",
    definition:
      "A part of the domain that is necessary but not a differentiator. It supports the core and can often be built with simpler approaches.",
  },
  "generic-subdomain": {
    term: "Generic Subdomain",
    definition:
      "A part of the domain that is common across many businesses (e.g., authentication, billing). It can often be purchased or outsourced.",
  },
  invariant: {
    term: "Invariant",
    definition:
      "A business rule that must always be true. Aggregates are responsible for enforcing their invariants before and after every change.",
  },
  command: {
    term: "Command",
    definition:
      "An intent to change the system's state. Commands are named as imperative verbs (e.g., PlaceOrder) and target a specific aggregate.",
  },
  "published-language": {
    term: "Published Language",
    definition:
      "A well-documented, shared data format used for communication between contexts. It acts as a contract that both sides agree to follow.",
  },
  workflow: {
    term: "Workflow / State Machine",
    definition:
      "A model of a process that moves through defined states via transitions, capturing the lifecycle of a key business concept like an order or claim.",
  },
  // Alias: codebase uses "anticorruption-layer" (no hyphen) in domain types
  "anticorruption-layer": {
    term: "Anti-Corruption Layer (ACL)",
    definition:
      "A translation layer that prevents one context's model from leaking into another. It isolates your domain from external or legacy models.",
    learnMore:
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer",
  },
};
