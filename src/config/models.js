/**
 * Centralized model configuration.
 * Add or remove OpenRouter models here — nothing else in the app should
 * hard-code a model id, provider name, or capability list.
 *
 * Model id format follows OpenRouter's `provider/model` convention.
 * See https://openrouter.ai/models for the full catalog.
 */

export const models = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Fast, capable multimodal flagship model from OpenAI.",
    capabilities: ["chat", "streaming", "vision"],
  },
];

export const defaultModelId = models[0].id;

export function getModelById(id) {
  return models.find((model) => model.id === id) ?? null;
}

export default models;
