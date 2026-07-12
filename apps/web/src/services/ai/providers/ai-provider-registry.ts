/**
 * AI Service — Provider Registry
 *
 * A singleton registry that manages the active AI provider at runtime.
 * Consumers call `AIProviderRegistry.getProvider()` to obtain whichever
 * concrete provider is currently registered.
 *
 * Swap the active provider (e.g. from NullAIProvider to OpenAIProvider)
 * by calling `AIProviderRegistry.register(provider)` at application startup
 * without changing any downstream service code.
 *
 * Usage:
 *   // At app startup (e.g. in instrumentation.ts):
 *   AIProviderRegistry.register(new OpenAIProvider());
 *
 *   // In any service:
 *   const provider = AIProviderRegistry.getProvider();
 *   const score = await provider.resumeScorer.score(input);
 */

import { IAIProvider } from "../interfaces/ai-provider.interface";
import { NullAIProvider } from "./null-provider";
import { logger } from "@smarthire/logger";

class AIProviderRegistryClass {
  private provider: IAIProvider = new NullAIProvider();

  /**
   * Register a concrete AI provider as the active implementation.
   * Overwrites any previously registered provider.
   */
  register(provider: IAIProvider): void {
    logger.info(`[AIProviderRegistry] Registering provider: ${provider.name} v${provider.version}`);
    this.provider = provider;
  }

  /**
   * Retrieve the currently active AI provider.
   * Falls back to NullAIProvider if none has been registered.
   */
  getProvider(): IAIProvider {
    return this.provider;
  }

  /**
   * Return the name and version of the active provider (useful for health APIs).
   */
  getProviderInfo(): { name: string; version: string } {
    return {
      name: this.provider.name,
      version: this.provider.version,
    };
  }
}

/**
 * Singleton instance — import this wherever provider access is needed.
 */
export const AIProviderRegistry = new AIProviderRegistryClass();
