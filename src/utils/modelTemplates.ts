/**
 * Model Templates System
 * Predefined configurations for different AI model types
 */

export type ModelTemplateType = 'llm-finetune' | 'llm-from-scratch' | 'vision-classification' | 'vision-detection' | 'physics-pinn' | 'rl-policy';

export interface HyperParameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  optimizer: string;
  scheduler?: string;
  [key: string]: unknown;
}

export interface ModelTemplate {
  id: ModelTemplateType;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "2-4 hours"
  hardwareRequirement: 'cpu' | 'gpu-6gb' | 'gpu-12gb' | 'gpu-24gb';
  minDataSize: string; // e.g., "100 documents", "1000 images"
  hyperparameters: HyperParameters;
  trainingStrategy: {
    epochs: number;
    validationSplit: number;
    earlyStoppingPatience: number;
    description: string;
  };
  dataPreprocessing: {
    normalization: string;
    augmentation: string[];
    splitting: { train: number; val: number; test: number };
  };
  evaluationMetrics: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  resources: {
    title: string;
    url: string;
  }[];
  exampleCode?: string;
}

/**
 * Collection of predefined model templates
 */
export const MODEL_TEMPLATES: Record<ModelTemplateType, ModelTemplate> = {
  'llm-finetune': {
    id: 'llm-finetune',
    name: 'Fine-tune Existing LLM',
    description: 'Adapt a pre-trained language model (like Phi-2 or Llama) to your domain knowledge',
    category: 'Language Model',
    difficulty: 'beginner',
    estimatedTime: '1-3 hours',
    hardwareRequirement: 'gpu-6gb',
    minDataSize: '10 documents (~10K words)',
    hyperparameters: {
      learningRate: 2e-5,
      epochs: 3,
      batchSize: 4,
      optimizer: 'AdamW',
      scheduler: 'linear',
      warmupSteps: 100,
      maxLength: 512,
      gradientAccumulation: 2,
    },
    trainingStrategy: {
      epochs: 3,
      validationSplit: 0.2,
      earlyStoppingPatience: 2,
      description: 'Use low learning rate and few epochs to preserve pre-trained knowledge while adapting to domain',
    },
    dataPreprocessing: {
      normalization: 'Tokenization with BPE (Byte-Pair Encoding)',
      augmentation: ['Paraphrasing', 'Back-translation'],
      splitting: { train: 0.8, val: 0.1, test: 0.1 },
    },
    evaluationMetrics: ['Perplexity', 'BLEU Score', 'Accuracy', 'Loss'],
    bestPractices: [
      'Use a smaller learning rate (2e-5) to avoid catastrophic forgetting',
      'Monitor validation loss - stop if it starts increasing',
      'Use mixed precision (FP16) to save memory',
      'Add domain-specific tokens to vocabulary if needed',
      'Validate on held-out test set before deployment',
    ],
    commonPitfalls: [
      'Learning rate too high causes model to forget pre-trained knowledge',
      'Too few epochs wastes pre-training; too many causes overfitting',
      'Using too small batch size (< 4) causes unstable training',
      'Not properly formatting training data (wrong prompt structure)',
      'Forgetting to save checkpoints during training',
    ],
    resources: [
      {
        title: 'HuggingFace Fine-tuning Guide',
        url: 'https://huggingface.co/docs/transformers/training',
      },
      {
        title: 'LoRA Efficient Fine-tuning',
        url: 'https://github.com/microsoft/LoRA',
      },
      {
        title: 'Phi-2 Model Card',
        url: 'https://huggingface.co/microsoft/phi-2',
      },
    ],
    exampleCode: `
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2")
model = AutoModelForCausalLM.from_pretrained("microsoft/phi-2")
# Fine-tune on your data
trainer = Trainer(model=model, args=training_args, train_dataset=train_data)
trainer.train()
    `,
  },

  'llm-from-scratch': {
    id: 'llm-from-scratch',
    name: 'Train LLM From Scratch',
    description: 'Build and train a small language model from zero (advanced, requires significant data)',
    category: 'Language Model',
    difficulty: 'advanced',
    estimatedTime: '8-40 hours',
    hardwareRequirement: 'gpu-24gb',
    minDataSize: '100K documents (~100M words)',
    hyperparameters: {
      learningRate: 6e-4,
      epochs: 10,
      batchSize: 64,
      optimizer: 'AdamW',
      scheduler: 'cosine',
      warmupSteps: 10000,
      modelSize: 'small', // 125M parameters
      numLayers: 12,
      hiddenSize: 768,
    },
    trainingStrategy: {
      epochs: 10,
      validationSplit: 0.05,
      earlyStoppingPatience: 3,
      description: 'Use cosine annealing with warmup. Monitor perplexity closely. Checkpoint every epoch.',
    },
    dataPreprocessing: {
      normalization: 'Unicode normalization + BPE tokenization',
      augmentation: [],
      splitting: { train: 0.95, val: 0.025, test: 0.025 },
    },
    evaluationMetrics: ['Perplexity', 'Bits Per Character (BPC)', 'Accuracy'],
    bestPractices: [
      'Start with small model (1-2B params) before scaling up',
      'Use cosine annealing with warmup for smooth training',
      'Accumulate gradients to increase effective batch size',
      'Save checkpoints frequently (every N steps, not just epochs)',
      'Monitor gradient norms - exploding gradients indicate instability',
      'Use gradient clipping if gradients explode',
    ],
    commonPitfalls: [
      'Insufficient training data (need 100M+ tokens)',
      'Learning rate too high → loss diverges or goes NaN',
      'Batch size too small → high variance, noisy training',
      'Not checkpointing → losing progress on long training runs',
      'Ignoring NaN losses early → training completely breaks',
    ],
    resources: [
      {
        title: 'NanoGPT by Karpathy',
        url: 'https://github.com/karpathy/nanoGPT',
      },
      {
        title: 'The Illustrated Transformer',
        url: 'https://jalammar.github.io/illustrated-transformer/',
      },
      {
        title: 'Attention is All You Need (Paper)',
        url: 'https://arxiv.org/abs/1706.03762',
      },
    ],
  },

  'vision-classification': {
    id: 'vision-classification',
    name: 'Image Classification',
    description: 'Classify images into predefined categories (e.g., cats vs dogs, mechanical parts)',
    category: 'Vision',
    difficulty: 'intermediate',
    estimatedTime: '2-6 hours',
    hardwareRequirement: 'gpu-6gb',
    minDataSize: '100 images per class',
    hyperparameters: {
      learningRate: 1e-3,
      epochs: 50,
      batchSize: 32,
      optimizer: 'Adam',
      scheduler: 'step',
      modelArchitecture: 'ResNet50',
      inputSize: 224,
    },
    trainingStrategy: {
      epochs: 50,
      validationSplit: 0.2,
      earlyStoppingPatience: 10,
      description: 'Use transfer learning (pre-trained weights). Freeze early layers, fine-tune last layers.',
    },
    dataPreprocessing: {
      normalization: 'ImageNet normalization (mean/std)',
      augmentation: [
        'Random horizontal flip',
        'Random rotation (±15°)',
        'Color jitter (brightness, contrast)',
        'Random crop',
      ],
      splitting: { train: 0.7, val: 0.15, test: 0.15 },
    },
    evaluationMetrics: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'Confusion Matrix'],
    bestPractices: [
      'Use transfer learning - pre-trained models are much faster',
      'Apply data augmentation to prevent overfitting',
      'Freeze early layers, only train final layers initially',
      'Monitor accuracy on validation set',
      'Use stratified splitting if classes are imbalanced',
    ],
    commonPitfalls: [
      'Not enough training data (< 100 images per class)',
      'Forgetting image normalization',
      'Training from scratch instead of using transfer learning',
      'Not augmenting data → overfitting',
      'Class imbalance not handled',
    ],
    resources: [
      {
        title: 'PyTorch Image Classification Tutorial',
        url: 'https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html',
      },
      {
        title: 'Torchvision Models',
        url: 'https://pytorch.org/vision/stable/models.html',
      },
    ],
  },

  'vision-detection': {
    id: 'vision-detection',
    name: 'Object Detection',
    description: 'Detect and localize objects in images (bounding boxes)',
    category: 'Vision',
    difficulty: 'advanced',
    estimatedTime: '6-20 hours',
    hardwareRequirement: 'gpu-12gb',
    minDataSize: '500 annotated images',
    hyperparameters: {
      learningRate: 1e-3,
      epochs: 100,
      batchSize: 16,
      optimizer: 'SGD',
      momentum: 0.9,
      modelArchitecture: 'YOLOv8',
    },
    trainingStrategy: {
      epochs: 100,
      validationSplit: 0.2,
      earlyStoppingPatience: 15,
      description: 'Use anchor-based detector (YOLO). Requires bounding box annotations in correct format.',
    },
    dataPreprocessing: {
      normalization: 'ImageNet normalization',
      augmentation: [
        'Random flip',
        'Random rotation',
        'Random scale',
        'Mosaic augmentation',
        'Mixup',
      ],
      splitting: { train: 0.7, val: 0.15, test: 0.15 },
    },
    evaluationMetrics: ['mAP@0.5', 'mAP@0.5:0.95', 'Precision', 'Recall'],
    bestPractices: [
      'Use YOLO or Faster R-CNN - don\'t build from scratch',
      'Ensure annotations are in correct format (COCO JSON or Pascal VOC)',
      'Use aggressive augmentation for object detection',
      'Monitor mAP metric on validation set',
      'Validate on diverse test set',
    ],
    commonPitfalls: [
      'Annotations in wrong format',
      'Too few training images (< 500)',
      'Ignoring class imbalance in small objects',
      'Over-augmentation causing unrealistic scenarios',
      'Not validating on truly held-out test set',
    ],
    resources: [
      {
        title: 'YOLOv8 Documentation',
        url: 'https://docs.ultralytics.com/',
      },
      {
        title: 'COCO Dataset Format',
        url: 'https://cocodataset.org/#format-data',
      },
    ],
  },

  'physics-pinn': {
    id: 'physics-pinn',
    name: 'Physics-Informed Neural Network (PINN)',
    description: 'Solve differential equations by embedding physics constraints into neural network',
    category: 'Physics AI',
    difficulty: 'advanced',
    estimatedTime: '4-8 hours',
    hardwareRequirement: 'gpu-6gb',
    minDataSize: 'No large dataset needed - physics-guided',
    hyperparameters: {
      learningRate: 1e-3,
      epochs: 20000,
      batchSize: 256,
      optimizer: 'Adam',
      hiddenSize: 64,
      numLayers: 4,
      activationFunction: 'tanh',
    },
    trainingStrategy: {
      epochs: 20000,
      validationSplit: 0.2,
      earlyStoppingPatience: 1000,
      description: 'Minimize both data loss and physics loss. Physics loss enforces differential equations.',
    },
    dataPreprocessing: {
      normalization: 'Normalize to [-1, 1] for tanh activation',
      augmentation: ['Collocation point sampling'],
      splitting: { train: 0.8, val: 0.1, test: 0.1 },
    },
    evaluationMetrics: ['Data Loss', 'Physics Loss', 'Total Loss', 'Boundary Condition Error'],
    bestPractices: [
      'Use automatic differentiation (torch.autograd)',
      'Balance data loss and physics loss (adjust weights)',
      'Use tanh activation for smoother gradients',
      'Sample collocation points randomly from domain',
      'Validate boundary conditions separately',
    ],
    commonPitfalls: [
      'Physics loss weight too high/low causes imbalance',
      'Using ReLU activation - causes gradient issues',
      'Sampling collocation points only at edges',
      'Not validating physics loss on test points',
      'Forgetting to normalize inputs to [-1, 1]',
    ],
    resources: [
      {
        title: 'Physics-Informed Neural Networks (PINNs) - Raissi et al.',
        url: 'https://arxiv.org/abs/1711.10566',
      },
      {
        title: 'DeepXDE Framework',
        url: 'https://deepxde.readthedocs.io/',
      },
    ],
  },

  'rl-policy': {
    id: 'rl-policy',
    name: 'Reinforcement Learning - Policy Optimization',
    description: 'Train an agent to control a system by learning optimal actions (robotics, games)',
    category: 'Reinforcement Learning',
    difficulty: 'advanced',
    estimatedTime: '4-12 hours',
    hardwareRequirement: 'gpu-6gb',
    minDataSize: 'Simulator required (no pre-existing dataset)',
    hyperparameters: {
      learningRate: 3e-4,
      epochs: 1000000,
      batchSize: 2048,
      optimizer: 'Adam',
      algorithm: 'PPO',
      clipRange: 0.2,
      numSteps: 2048,
    },
    trainingStrategy: {
      epochs: 1000000,
      validationSplit: 0.0,
      earlyStoppingPatience: 50000,
      description: 'Use PPO (Proximal Policy Optimization). Collect trajectories, update policy, repeat.',
    },
    dataPreprocessing: {
      normalization: 'Observation normalization (running mean/std)',
      augmentation: [],
      splitting: { train: 1.0, val: 0.0, test: 0.0 },
    },
    evaluationMetrics: ['Episode Reward', 'Episode Length', 'Policy Loss', 'Value Loss'],
    bestPractices: [
      'Use environment wrappers for normalization',
      'Reward shaping helps training (but causes bias)',
      'Use GAE (Generalized Advantage Estimation) for value targets',
      'Monitor mean episode reward',
      'Validate in deterministic mode (no exploration)',
    ],
    commonPitfalls: [
      'Learning rate too high causes policy collapse',
      'Reward scale too large/small',
      'Not normalizing observations',
      'Insufficient environment interaction',
      'Training against non-stationary environment',
    ],
    resources: [
      {
        title: 'Stable-Baselines3 Documentation',
        url: 'https://stable-baselines3.readthedocs.io/',
      },
      {
        title: 'Proximal Policy Optimization (PPO) Paper',
        url: 'https://arxiv.org/abs/1707.06347',
      },
      {
        title: 'OpenAI Gymnasium',
        url: 'https://gymnasium.farama.org/',
      },
    ],
  },
};

/**
 * Get template by ID
 */
export function getTemplate(id: ModelTemplateType): ModelTemplate | undefined {
  return MODEL_TEMPLATES[id];
}

/**
 * Get all templates
 */
export function getAllTemplates(): ModelTemplate[] {
  return Object.values(MODEL_TEMPLATES);
}

/**
 * Get templates by difficulty level
 */
export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ModelTemplate[] {
  return Object.values(MODEL_TEMPLATES).filter(t => t.difficulty === difficulty);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): ModelTemplate[] {
  return Object.values(MODEL_TEMPLATES).filter(t => t.category === category);
}

/**
 * Get recommended template based on user input
 */
export function getRecommendedTemplate(task: string): ModelTemplate | undefined {
  const taskLower = task.toLowerCase();

  if (taskLower.includes('language') || taskLower.includes('text') || taskLower.includes('question')) {
    return MODEL_TEMPLATES['llm-finetune'];
  }
  if (taskLower.includes('image') || taskLower.includes('photo') || taskLower.includes('classify')) {
    return MODEL_TEMPLATES['vision-classification'];
  }
  if (taskLower.includes('detect') || taskLower.includes('find')) {
    return MODEL_TEMPLATES['vision-detection'];
  }
  if (taskLower.includes('equation') || taskLower.includes('physics') || taskLower.includes('solve')) {
    return MODEL_TEMPLATES['physics-pinn'];
  }
  if (taskLower.includes('control') || taskLower.includes('robot') || taskLower.includes('agent')) {
    return MODEL_TEMPLATES['rl-policy'];
  }

  return undefined;
}
