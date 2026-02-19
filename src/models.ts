// Models configuration for chatGG
// Models that support images (multimodal)
export const multimodalModels = [
  {
    id: "mistralai/ministral-14b-instruct-2512",
    name: "Mistral Ministral 14B",
    description: "Mistral model 14B parameters, supports images",
    supportsImages: true,
    maxTokens: 2048,
    temperature: 0.15,
    topP: 1.00,
    frequencyPenalty: 0.00,
    presencePenalty: 0.00
  },
  {
    id: "meta/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick 17B",
    description: "Meta Llama 4 Maverick 17B, supports images",
    supportsImages: true,
    maxTokens: 512,
    temperature: 1.00,
    topP: 1.00,
    frequencyPenalty: 0.00,
    presencePenalty: 0.00
  },
  {
    id: "google/gemma-3-27b-it",
    name: "Gemma 3 27B",
    description: "Google Gemma 3 27B, supports images",
    supportsImages: true,
    maxTokens: 512,
    temperature: 0.20,
    topP: 0.70,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  {
    id: "microsoft/phi-4-multimodal-instruct",
    name: "Phi-4 Multimodal",
    description: "Microsoft Phi-4 Multimodal, supports images",
    supportsImages: true,
    maxTokens: 512,
    temperature: 0.10,
    topP: 0.70,
    frequencyPenalty: 0.00,
    presencePenalty: 0.00
  }
];

// Models that don't support images but are very fast
export const fastModels = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "OpenAI GPT-OSS 120B, very fast response",
    supportsImages: false,
    maxTokens: 4096,
    temperature: 1,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "OpenAI GPT-OSS 20B, very fast response",
    supportsImages: false,
    maxTokens: 4096,
    temperature: 1,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  }
];

// All available models
export const allModels = [...multimodalModels, ...fastModels];

// Get model by ID
export function getModelById(modelId: string) {
  return allModels.find(model => model.id === modelId);
}

// Check if model supports images
export function modelSupportsImages(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.supportsImages ?? false;
}
