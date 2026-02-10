import type {
  DomainModel,
  BoundedContext,
  ContextRelationship,
  SubdomainType,
  CommunicationPattern,
} from "@foe/schemas/ddd";

/**
 * CMLWriter converts DomainModel to ContextMapper CML (Context Mapping Language) format.
 * 
 * This follows the Ports & Adapters pattern where:
 * - Zod schemas = Canonical domain model (single source of truth)
 * - CML = External format consumed by ContextMapper tooling
 * - CMLWriter = Outbound adapter
 */
export class CMLWriter {
  /**
   * Convert a DomainModel to CML format
   */
  write(model: DomainModel): string {
    const lines: string[] = [];
    
    // Add header comment
    lines.push(`// Generated from Katalyst Domain Model: ${model.name}`);
    lines.push(`// Generated at: ${new Date().toISOString()}`);
    lines.push("");
    
    // Generate ContextMap
    lines.push(this.generateContextMap(model));
    lines.push("");
    
    // Generate BoundedContexts
    for (const context of model.boundedContexts) {
      lines.push(this.generateBoundedContext(context));
      lines.push("");
    }
    
    return lines.join("\n");
  }

  /**
   * Generate the ContextMap block
   */
  private generateContextMap(model: DomainModel): string {
    const lines: string[] = [];
    const contextMapName = this.toPascalCase(model.name) + "ContextMap";
    
    lines.push(`ContextMap ${contextMapName} {`);
    lines.push("  type SYSTEM_LANDSCAPE");
    lines.push("  state AS_IS");
    lines.push("");
    
    // Add contains statements for each bounded context
    for (const context of model.boundedContexts) {
      lines.push(`  contains ${this.toPascalCase(context.slug)}Context`);
    }
    
    // Add relationships
    if (model.boundedContexts.some(c => c.relationships && c.relationships.length > 0)) {
      lines.push("");
      for (const context of model.boundedContexts) {
        for (const rel of context.relationships || []) {
          const relLine = this.generateRelationship(context.slug, rel);
          if (relLine) {
            lines.push(`  ${relLine}`);
          }
        }
      }
    }
    
    lines.push("}");
    return lines.join("\n");
  }

  /**
   * Generate a relationship line
   */
  private generateRelationship(
    sourceSlug: string,
    rel: ContextRelationship
  ): string {
    const source = this.toPascalCase(sourceSlug) + "Context";
    const target = this.toPascalCase(rel.targetContext) + "Context";
    
    switch (rel.type) {
      case "upstream":
        return `${target} [U]->[D] ${source}${rel.description ? ` : "${rel.description}"` : ""}`;
      
      case "downstream":
        return `${source} [D]<-[U] ${target}${rel.description ? ` : "${rel.description}"` : ""}`;
      
      case "partnership":
        return `${source} [P]<->[P] ${target}${rel.description ? ` : "${rel.description}"` : ""}`;
      
      case "shared-kernel":
        return `${source} [SK]<->[SK] ${target}${rel.description ? ` : "${rel.description}"` : ""}`;
      
      case "separate-ways":
        return `${source} [PL] Separate-Ways ${target}${rel.description ? ` : "${rel.description}"` : ""}`;
      
      default:
        return "";
    }
  }

  /**
   * Generate a BoundedContext block
   */
  private generateBoundedContext(context: BoundedContext): string {
    const lines: string[] = [];
    const name = this.toPascalCase(context.slug) + "Context";
    
    lines.push(`BoundedContext ${name} {`);
    
    // Add subdomain type
    if (context.subdomainType) {
      lines.push(`  type ${this.mapSubdomainType(context.subdomainType)}`);
    }
    
    // Add domain vision statement
    if (context.responsibility) {
      lines.push(`  domainVisionStatement "${context.responsibility}"`);
    }
    
    // Add team ownership if present
    if (context.teamOwnership) {
      lines.push(`  /* Team: ${context.teamOwnership} */`);
    }
    
    lines.push("}");
    return lines.join("\n");
  }

  /**
   * Map subdomain type to CML format
   */
  private mapSubdomainType(type: SubdomainType): string {
    switch (type) {
      case "core":
        return "CORE_DOMAIN";
      case "supporting":
        return "SUPPORTING_DOMAIN";
      case "generic":
        return "GENERIC_SUBDOMAIN";
      default:
        return "GENERIC_SUBDOMAIN";
    }
  }

  /**
   * Convert string to PascalCase for CML identifiers
   * Handles: kebab-case, snake_case, camelCase, and space separated words
   */
  private toPascalCase(str: string): string {
    // First, handle camelCase by inserting spaces before capitals
    const spaced = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Split on spaces, hyphens, and underscores
    return spaced
      .split(/[\s\-_]+/)
      .filter(part => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }
}
