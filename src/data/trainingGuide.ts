/**
 * Complete AI Training Guide and Best Practices
 * Comprehensive reference for all aspects of training AI models
 */

export interface TrainingGuideSection {
  title: string;
  icon: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

export interface BestPractice {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'high' | 'medium' | 'low';
}

export interface CommonMistake {
  mistake: string;
  consequence: string;
  solution: string;
  prevention: string;
}

export const TRAINING_GUIDE_SECTIONS: TrainingGuideSection[] = [
  {
    title: 'Understanding AI Training',
    icon: '🧠',
    content: `
AI training is the process of teaching a neural network to map inputs to outputs by showing it examples.

**The Training Loop:**
1. Forward Pass: Feed input through network, get prediction
2. Calculate Loss: Measure how wrong the prediction is
3. Backward Pass: Calculate gradients (which direction reduces error)
4. Update Weights: Adjust parameters in direction that reduces loss
5. Repeat: Do this millions of times

**Key Concepts:**
- **Model**: The neural network (the "brain") - what we're training
- **Weights/Parameters**: Numbers the model learns (billions of them!)
- **Dataset**: Examples used for training
- **Epoch**: One complete pass through the entire dataset
- **Batch**: Small group of examples processed together
- **Loss**: How wrong the model is (we minimize this)
- **Optimizer**: Algorithm that updates weights (Adam, SGD, AdamW)
- **Learning Rate**: Size of each weight adjustment (critical!)
- **Overfitting**: Model memorizes instead of generalizing
- **Inference**: Using trained model to make predictions

**Training vs Testing:**
- Training: Model sees data, learns patterns
- Validation: Model sees new data, measure performance without learning
- Testing: Final evaluation on completely held-out data

Always keep test data completely separate!
    `,
  },

  {
    title: 'Data Preparation',
    icon: '📊',
    content: `
High-quality data is more important than a fancy model.

**Data Quality Checklist:**
✓ Clean: Remove duplicates, fix encoding issues
✓ Labeled: Each example has correct output
✓ Diverse: Covers different scenarios and edge cases
✓ Balanced: Classes have similar representation (especially for classification)
✓ Sufficient: Enough examples to learn patterns (100+ for small models, millions for large ones)
✓ Representative: Training data looks like real-world data

**Common Data Issues:**
- Missing values → impute or remove rows
- Outliers → investigate (real vs error?), handle appropriately
- Class imbalance → use weighted loss, over/undersampling, or SMOTE
- Encoding issues → convert to UTF-8, handle special characters
- Duplicates → dedup before training (inflates performance metrics)
- Data leakage → ensure test data is truly separate

**Data Splitting:**
Standard: 70% training, 15% validation, 15% test
Alternatives: 80-10-10 or 60-20-20 depending on dataset size
Always split BEFORE any preprocessing/augmentation!

**Preprocessing Steps:**
1. Load data
2. Handle missing values
3. Remove/fix encoding issues
4. Detect and remove duplicates
5. Handle outliers
6. Split into train/val/test
7. Apply normalization/standardization
8. Augment training data if needed

⚠️ CRITICAL: Fit preprocessing on training data only!
If you normalize using entire dataset, you leak test information.
    `,
  },

  {
    title: 'Training Pipeline',
    icon: '🔄',
    content: `
Standard machine learning pipeline has these steps:

**Step 1: Define Problem**
- What are we predicting? (regression, classification, generation?)
- What's success? (accuracy, loss, F1 score?)
- What are constraints? (latency, model size, fairness?)

**Step 2: Collect Data**
- Gather examples
- Label them correctly
- Document data source and any biases

**Step 3: Preprocess**
- Normalize values to [0,1] or [-1,1]
- Tokenize text, encode categoricals
- Augment if needed
- Split into train/val/test

**Step 4: Build Model**
- Choose architecture (CNN, Transformer, LSTM, etc.)
- Define number of layers and parameters
- Pick loss function and optimizer
- Choose learning rate

**Step 5: Train**
- Forward pass on batch
- Calculate loss
- Backward pass (compute gradients)
- Update weights
- Repeat for N epochs
- Monitor loss on both training and validation sets

**Step 6: Evaluate**
- Test on held-out test set
- Calculate appropriate metrics
- Analyze errors and failure cases
- Check for overfitting

**Step 7: Deploy**
- Convert to production format (ONNX, TorchScript)
- Optimize for inference speed
- Set up monitoring
- Handle edge cases

If performance is bad, go back to Step 1-3!
Often it's a data problem, not a model problem.
    `,
  },

  {
    title: 'Choosing a Model',
    icon: '🏗️',
    content: `
Different problems need different architectures.

**Model Types by Task:**

**Classification**: Predict category (cat, dog, spam, not spam)
- Architecture: MLP, CNN, Vision Transformer
- Loss: CrossEntropyLoss
- Metrics: Accuracy, F1, Precision, Recall

**Regression**: Predict continuous number (price, temperature)
- Architecture: MLP, linear regression
- Loss: MSE, L1 (MAE)
- Metrics: MSE, RMSE, R²

**Language Modeling**: Predict next token
- Architecture: Transformer (GPT-style)
- Loss: CrossEntropyLoss
- Metrics: Perplexity, BLEU

**Object Detection**: Find objects in image
- Architecture: YOLO, Faster R-CNN
- Loss: Combination of classification + localization
- Metrics: mAP (mean Average Precision)

**Sequence-to-Sequence**: Translate, summarize
- Architecture: Transformer (Encoder-Decoder)
- Loss: CrossEntropyLoss
- Metrics: BLEU, ROUGE

**Reinforcement Learning**: Learn optimal actions
- Architecture: Policy network + Value network
- Loss: Policy loss, Value loss
- Metrics: Episode reward, episode length

**Physics-Informed NN**: Solve differential equations
- Architecture: MLP with physics constraints
- Loss: Data loss + Physics loss
- Metrics: Physics loss, boundary condition error

**Rule of Thumb:**
- Start simple (MLP for everything)
- Only add complexity if needed
- Use transfer learning (pre-trained models) when possible
- Don't build from scratch unless you have reason to
    `,
  },

  {
    title: 'Hyperparameter Tuning',
    icon: '⚙️',
    content: `
Hyperparameters are settings you choose (not learned by model).

**Most Important:**
1. **Learning Rate** (LR): How big each weight update is
   - Too high: Loss goes NaN or diverges
   - Too low: Training very slow, gets stuck
   - Good starting point: 0.1, 0.01, 0.001, 0.0001
   - Decreasing LR during training often helps

2. **Batch Size**: How many examples per update
   - Larger batch → more stable but slower convergence
   - Smaller batch → noisier but faster convergence
   - Typical: 32, 64, 128, 256

3. **Number of Epochs**: How many times through dataset
   - Too few: Underfitting (high both train and test loss)
   - Too many: Overfitting (low train loss, high test loss)
   - Use early stopping to find right point

**Secondary:**
- Optimizer: Adam usually works best (SGD, AdamW, RMSprop)
- Momentum: 0.9 for SGD with momentum
- Weight decay: 1e-5 or 1e-4 (L2 regularization)
- Dropout: 0.1-0.5 for regularization

**Tuning Strategy:**
1. Start with defaults from literature
2. Do coarse grid search on learning rate and batch size
3. Train fully and check validation curve
4. Fine-tune based on what you see
5. Try different optimizers if stuck

**Validation Curves Tell Story:**
- Both losses high & not decreasing → model too small or LR too low
- Train loss low, val loss high → overfitting
- Train loss high & not decreasing → underfitting or LR too high

Don't obsess over tuning - 80% of improvement comes from data quality!
    `,
  },

  {
    title: 'Detecting and Preventing Overfitting',
    icon: '⚠️',
    content: `
Overfitting means model memorizes data instead of learning patterns.

**Symptoms:**
- Training loss: 0.01 (very low)
- Validation loss: 0.50 (very high)
- Training accuracy: 99%
- Validation accuracy: 60%

Big gap between train and val = overfitting

**Prevention Strategies:**

1. **Regularization**
   - Dropout: Randomly disable neurons during training (0.2-0.5)
   - L2 (weight decay): Penalize large weights (1e-5 to 1e-3)
   - L1: Alternative regularization
   - Early stopping: Stop when val loss increases

2. **More/Better Data**
   - Overfitting often means too little data
   - Add more real data if possible
   - Or augment existing data artificially

3. **Simpler Model**
   - Fewer layers
   - Fewer parameters
   - Simpler architecture

4. **Data Augmentation**
   - For images: rotation, flipping, cropping, color jitter
   - For text: paraphrasing, back-translation, synonym replacement
   - For time series: time warping, magnitude warping

5. **Learning Rate Scheduling**
   - Start high, decrease over time
   - Helps model converge better
   - Common: cosine annealing, step decay, linear decay

**Early Stopping:**
Monitor validation loss. If it doesn't improve for N epochs, stop training.
This is the simplest, most effective regularization!

Code example:
\`\`\`python
if val_loss < best_val_loss:
    best_val_loss = val_loss
    patience = 0
    torch.save(model.state_dict(), 'best_model.pth')
else:
    patience += 1
    if patience > 10:
        print("Early stopping!")
        break
\`\`\`
    `,
  },

  {
    title: 'Common Mistakes & Solutions',
    icon: '🐛',
    content: `
Mistakes every ML engineer makes (at least once):

**❌ Data Mistake: Not splitting data properly**
❌ Consequence: Model performance estimates are too optimistic
✓ Solution: Always split BEFORE preprocessing. Keep test set completely separate.

**❌ Data Mistake: Not normalizing inputs**
❌ Consequence: Training is unstable, model doesn't learn
✓ Solution: Always normalize/standardize inputs (mean 0, std 1 or scale to [0,1])

**❌ Training Mistake: Learning rate too high**
❌ Consequence: Loss goes NaN or explodes
✓ Solution: If loss is NaN/inf, first thing: lower learning rate 10x

**❌ Training Mistake: Batch size too small**
❌ Consequence: Noisy training, high variance in loss
✓ Solution: Increase batch size (try 2x or 4x)

**❌ Training Mistake: Training too few epochs**
❌ Consequence: Underfitting, poor performance
✓ Solution: Train until validation loss stops improving, use early stopping

**❌ Overfitting Mistake: Using test data for validation**
❌ Consequence: Inflated performance metrics
✓ Solution: Split into train/val/test. Only look at test data once!

**❌ Model Mistake: Initializing wrong weights**
❌ Consequence: Dead neurons, slow training
✓ Solution: Use proper initialization (Xavier for linear, He for ReLU)

**❌ Deployment Mistake: Not testing on production data**
❌ Consequence: Model fails in real world
✓ Solution: Test on truly held-out data. Monitor performance after deployment.

**❌ Debugging Mistake: Not logging enough**
❌ Consequence: Can't figure out what went wrong
✓ Solution: Log losses, accuracies, gradients. Use TensorBoard or Weights & Biases.

**Rule of Thumb:** If something seems wrong, check your data first, not the model!
    `,
  },

  {
    title: 'Evaluation Metrics',
    icon: '📈',
    content: `
Different tasks need different metrics.

**Classification Metrics:**
- **Accuracy**: (TP + TN) / Total - percent correct
- **Precision**: TP / (TP + FP) - when we predict positive, how often right?
- **Recall**: TP / (TP + FN) - of actual positives, how many did we find?
- **F1**: Harmonic mean of precision & recall (use for imbalanced classes)
- **ROC-AUC**: Area under receiver operating characteristic curve
- **PR-AUC**: Area under precision-recall curve (better for imbalanced)

When to use what:
- Balanced classes: Accuracy
- Imbalanced classes: F1, ROC-AUC, PR-AUC
- Care more about false negatives: Recall
- Care more about false positives: Precision

**Regression Metrics:**
- **MSE**: Mean Squared Error - average of squared differences
- **RMSE**: Root MSE - same scale as target
- **MAE**: Mean Absolute Error - average absolute differences
- **R²**: Coefficient of determination - percent of variance explained
- **MAPE**: Mean Absolute Percentage Error - good for different scales

**Language Model Metrics:**
- **Perplexity**: How "surprised" model is by text (lower is better)
- **BLEU**: How similar to reference translation (0-1)
- **ROUGE**: Recall-Oriented Understudy for Gisting Evaluation
- **Accuracy**: For simple classification tasks

**Detection Metrics:**
- **mAP**: Mean Average Precision - standard for object detection
- **IoU**: Intersection over Union - how much bounding boxes overlap

**Always:**
1. Choose metric BEFORE training
2. Track multiple metrics (not just one)
3. Monitor both training and validation metrics
4. Check performance on subgroups (fairness)
5. Look at failure cases manually
    `,
  },

  {
    title: 'Troubleshooting Guide',
    icon: '🔧',
    content: `
Your model isn't training? Check this list:

**Problem: Loss is NaN or Inf**
Causes (in order of likelihood):
1. Learning rate too high (very likely!)
2. Data contains inf/NaN values
3. Wrong loss function
4. Exploding gradients
Solutions:
- Lower learning rate 10x
- Check data for invalid values
- Use gradient clipping: torch.nn.utils.clip_grad_norm_
- Normalize inputs properly

**Problem: Loss not decreasing at all**
Causes:
1. Learning rate too low
2. Model too small
3. Data problem (duplicate, mislabeled)
4. Wrong architecture
Solutions:
- Increase learning rate
- Add more layers/parameters
- Inspect data manually
- Try different architecture

**Problem: Training fast but accuracy stuck low**
Causes:
1. Underfitting (model too simple)
2. Learning rate too low
3. Data problem
4. Wrong task definition
Solutions:
- Bigger model, more layers
- Increase learning rate
- Check data labels
- Verify metric calculation

**Problem: Training accuracy high, validation accuracy low**
This is overfitting!
Solutions:
- Add regularization (dropout, L2)
- More data or data augmentation
- Simpler model
- Early stopping
- Lower learning rate

**Problem: Out of memory (OOM)**
Solutions (in order):
1. Reduce batch size (4 → 2)
2. Reduce model size
3. Use mixed precision (torch.cuda.amp)
4. Use gradient accumulation
5. Use CPU (slower but more memory)

**Problem: Training very slow**
Solutions:
1. Use GPU (if not already)
2. Increase batch size (more stable, faster)
3. Use mixed precision
4. Simplify model
5. Profile code to find bottleneck

**Problem: Results not reproducible**
Causes:
1. Random seed not set
2. GPU randomness
3. Different data order
Solutions:
- Set seed: np.random.seed(0), torch.manual_seed(0)
- Set deterministic: torch.use_deterministic_algorithms(True)
- Use DataLoader with same seed
- Document environment (PyTorch version, GPU, etc.)
    `,
  },

  {
    title: 'Resources & Learning Path',
    icon: '📚',
    content: `
How to learn machine learning effectively.

**Foundation (Weeks 1-4):**
- Python programming (functions, classes, libraries)
- NumPy (arrays, matrix operations)
- Pandas (data manipulation)
- Matplotlib (visualization)

**Fundamentals (Weeks 5-12):**
- Linear algebra (vectors, matrices, eigenvalues)
- Statistics (distributions, hypothesis testing, probabilities)
- Calculus basics (derivatives, gradients)
- Intro to machine learning concepts

**Deep Learning (Weeks 13-24):**
- PyTorch fundamentals (tensors, autograd)
- Neural networks (perceptrons, MLPs)
- CNNs (convolutional neural networks)
- RNNs/LSTMs (for sequences)
- Transformers (modern architecture)

**Specialization (Weeks 25+):**
- NLP: Language models, fine-tuning
- Computer Vision: Detection, segmentation
- Reinforcement Learning: Policy optimization
- Physics AI: PINNs, differential equations

**Best Free Resources:**
- fastai (practical deep learning) - fast.ai
- Stanford CS231n (computer vision) - Stanford lecture notes
- Stanford CS224n (NLP) - Stanford lecture notes
- 3Blue1Brown (neural network intuition) - YouTube
- Andrew Ng courses - Coursera
- Papers with Code (see implementations) - paperswithcode.com
- Hugging Face course (NLP) - huggingface.co/course

**Books:**
- "Deep Learning" by Goodfellow (free online)
- "Hands-On ML" by Géron (practical)
- "Dive into Deep Learning" (d2l.ai - free online)

**Practice:**
- Kaggle (competitions, datasets) - kaggle.com
- Google Colab (free GPU) - colab.research.google.com
- Hugging Face Hub (models, datasets) - huggingface.co
- Papers with Code (implementations) - paperswithcode.com

**Pro Tips:**
1. Learn by doing - build projects from day 1
2. Understand theory before memorizing code
3. Read papers after getting basics (not before!)
4. Join communities (Reddit, Discord, Twitter)
5. Build portfolio projects on GitHub
6. Read error messages carefully - they tell you what's wrong!
    `,
  },
];

export const BEST_PRACTICES: BestPractice[] = [
  {
    title: 'Always split data properly',
    description: 'Split into train/val/test BEFORE preprocessing. Test set is sacred.',
    category: 'Data',
    difficulty: 'beginner',
    impact: 'high',
  },
  {
    title: 'Normalize/standardize inputs',
    description: 'Scale inputs to mean 0, std 1 or [0, 1] range. Critical for convergence.',
    category: 'Data',
    difficulty: 'beginner',
    impact: 'high',
  },
  {
    title: 'Monitor training curves',
    description: 'Plot loss and metrics. Gap between train/val indicates overfitting.',
    category: 'Training',
    difficulty: 'beginner',
    impact: 'high',
  },
  {
    title: 'Start with simple models',
    description: 'Always start simple (linear, shallow MLP), then add complexity.',
    category: 'Modeling',
    difficulty: 'beginner',
    impact: 'high',
  },
  {
    title: 'Use transfer learning when possible',
    description: 'Pre-trained models are almost always better than training from scratch.',
    category: 'Modeling',
    difficulty: 'intermediate',
    impact: 'high',
  },
  {
    title: 'Implement early stopping',
    description: 'Stop training when validation loss stops improving. Prevents overfitting.',
    category: 'Training',
    difficulty: 'intermediate',
    impact: 'high',
  },
  {
    title: 'Use learning rate schedules',
    description: 'Decrease learning rate during training for better convergence.',
    category: 'Hyperparameter',
    difficulty: 'intermediate',
    impact: 'medium',
  },
  {
    title: 'Data augmentation',
    description: 'Artificially create more training data through transformations.',
    category: 'Data',
    difficulty: 'intermediate',
    impact: 'high',
  },
  {
    title: 'Batch normalization',
    description: 'Normalize layer inputs. Speeds up training, better convergence.',
    category: 'Modeling',
    difficulty: 'intermediate',
    impact: 'medium',
  },
  {
    title: 'Set random seeds',
    description: 'Set seeds in NumPy, PyTorch, TensorFlow for reproducibility.',
    category: 'Engineering',
    difficulty: 'beginner',
    impact: 'medium',
  },
];

export const COMMON_MISTAKES: CommonMistake[] = [
  {
    mistake: 'Using test data during training',
    consequence: 'Inflated performance estimates, model fails in production',
    solution: 'Never touch test data until final evaluation',
    prevention: 'Use separate train/val/test split from the start',
  },
  {
    mistake: 'Learning rate too high',
    consequence: 'Loss goes NaN or diverges, model completely fails',
    solution: 'Reduce learning rate 10x and try again',
    prevention: 'Start with small LR (0.0001), increase if needed',
  },
  {
    mistake: 'Batch size too small',
    consequence: 'High variance in loss, noisy training',
    solution: 'Double batch size until training stabilizes',
    prevention: 'Use batch sizes of 32, 64, 128+',
  },
  {
    mistake: 'Not normalizing inputs',
    consequence: 'Unstable training, poor convergence',
    solution: 'Subtract mean, divide by std: (x - mean) / std',
    prevention: 'Always normalize before training',
  },
  {
    mistake: 'Training too few epochs',
    consequence: 'Underfitting, poor performance',
    solution: 'Train until validation loss plateaus',
    prevention: 'Use early stopping based on validation metric',
  },
  {
    mistake: 'Class imbalance not handled',
    consequence: 'Model predicts majority class, poor recall on minority',
    solution: 'Use weighted loss, oversampling, or SMOTE',
    prevention: 'Check class distribution in data',
  },
  {
    mistake: 'Forgetting model.eval() during validation',
    consequence: 'Dropout/batch norm active during test, inconsistent behavior',
    solution: 'Always call model.eval() before evaluation',
    prevention: 'Wrap in context: with torch.no_grad(): model.eval()',
  },
  {
    mistake: 'Building model from scratch',
    consequence: 'Slower training, worse results, reinventing the wheel',
    solution: 'Use transfer learning from pre-trained models',
    prevention: 'Always check for existing models first',
  },
  {
    mistake: 'Ignoring NaN loss early',
    consequence: 'Training completely broken, wasted compute',
    solution: 'Immediately lower learning rate when loss is NaN',
    prevention: 'Check for NaN every epoch, fail fast',
  },
  {
    mistake: 'Not validating on truly held-out data',
    consequence: 'Estimates of real-world performance are wrong',
    solution: 'Collect completely separate test set',
    prevention: 'Lock test set before any model development',
  },
];
