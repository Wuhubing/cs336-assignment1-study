/* Extra visual material per lesson: interactive widget, figures, inline figures, formula colour keys, and external reading.
   Figures under assets/diagrams/ are original. Third-party images live in assets/images/cc/ and always carry a credit. */
(()=>{
  const CC_BY_4={license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'};
  const dvgodoy=(file)=>({author:'Daniel Voigt Godoy',source:'dl-visuals',sourceUrl:`https://github.com/dvgodoy/dl-visuals/blob/main/${file}`,...CC_BY_4});
  window.STUDY_VISUALS={
    orientation:{
      inline:[{after:1,src:'inline/orientation-repo.svg',alt:'Where your code lives',caption:'Your code lives in cs336_basics; adapters.py is only glue; the staff tests define the behaviour you must match.'}],
      formulaNotes:{U0:[{sym:'\\prod_{t=1}^{T}',color:'gold',label:'one factor per position'},{sym:'x_{<t}',color:'blue',label:'only the prefix — this is why the model is causal'}]},
      links:[
        {title:'Transformers, the tech behind LLMs',author:'3Blue1Brown',url:'https://www.youtube.com/watch?v=wjZofJX0v4M',kind:'video',note:'A visual tour of the whole pipeline you are about to build.'},
        {title:'Language Models are Unsupervised Multitask Learners (GPT-2)',author:'Radford et al., 2019',url:'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf',kind:'paper',note:'The decoder-only LM and byte-level BPE this assignment follows.'}
      ]
    },
    unicode:{
      inline:[{after:1,src:'inline/unicode-repr.svg',alt:'print versus repr of a control character',caption:'A control character can be invisible when printed — inspect with repr() or the raw bytes.'}],
      links:[
        {title:'The Absolute Minimum Every Software Developer Must Know About Unicode',author:'Joel Spolsky',url:'https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/',kind:'article',note:'The classic, readable introduction to code points and encodings.'},
        {title:'Unicode HOWTO',author:'Python documentation',url:'https://docs.python.org/3/howto/unicode.html',kind:'article',note:'How str, bytes, ord() and chr() relate in Python.'}
      ]
    },
    utf8:{
      widget:'utf8',
      inline:[{after:1,src:'inline/utf8-count.svg',alt:'Characters versus bytes and an invalid byte',caption:'Count bytes, not characters, when you reason about token lengths — and expect invalid byte sequences when decoding arbitrary IDs.'}],
      formulaNotes:{U0b:[{sym:'(b_1,\\ldots,b_k)',color:'red',label:'the bytes a tokenizer actually sees'},{sym:'1\\le k\\le4',color:'blue',label:'variable length: ASCII 1 byte, emoji 4'}]},
      links:[
        {title:'UTF-8',author:'Wikipedia',url:'https://en.wikipedia.org/wiki/UTF-8',kind:'article',note:'The encoding table and the bit layout, with examples.'},
        {title:'UTF-8 Everywhere',author:'utf8everywhere.org',url:'https://utf8everywhere.org/',kind:'article',note:'Why UTF-8 won, and the pitfalls of UTF-16.'}
      ]
    },
    subword:{
      inline:[{after:1,src:'inline/subword-context.svg',alt:'The same word splits differently in context',caption:'Leading spaces belong to tokens, so “The” and “␠the” are different vocabulary items.'}],
      formulaNotes:{U0c:[{sym:'r_{\\mathrm{bytes/token}}',color:'red',label:'compression ratio: higher = shorter sequences'}]},
      links:[
        {title:'Tiktokenizer',author:'interactive tool',url:'https://tiktokenizer.vercel.app/',kind:'code',note:'Paste text and see how real GPT tokenizers split it.'},
        {title:'Neural Machine Translation of Rare Words with Subword Units',author:'Sennrich et al., 2016',url:'https://arxiv.org/abs/1508.07909',kind:'paper',note:'The paper that brought BPE to NLP.'}
      ]
    },
    'bpe-train':{
      widget:'bpe-train',
      inline:[{after:1,src:'inline/bpe-boundaries.svg',alt:'Pair counts stay inside pre-tokens',caption:'Pre-tokens and special tokens are hard walls: no pair is counted across them.'}],
      formulaNotes:{U1:[{sym:'256',color:'blue',label:'every possible byte'},{sym:'|S|',color:'gold',label:'special tokens'},{sym:'N_{\\mathrm{merges}}',color:'red',label:'one new token per merge'}]},
      links:[
        {title:'Byte-Pair Encoding tokenization',author:'Hugging Face LLM Course',url:'https://huggingface.co/learn/llm-course/chapter6/5',kind:'article',note:'Step-by-step merge tables on a toy corpus. The page includes example code — follow the course policy.'},
        {title:'Neural Machine Translation of Rare Words with Subword Units',author:'Sennrich et al., 2016',url:'https://arxiv.org/abs/1508.07909',kind:'paper',note:'The original BPE-for-NLP algorithm.'}
      ]
    },
    'bpe-runs':{
      links:[
        {title:'TinyStories: How Small Can Language Models Be…',author:'Eldan & Li, 2023',url:'https://arxiv.org/abs/2305.07759',kind:'paper',note:'Where the TinyStories dataset comes from and why it is simple.'},
        {title:'OpenWebText corpus',author:'Gokaslan & Cohen',url:'https://skylion007.github.io/OpenWebTextCorpus/',kind:'article',note:'An open re-creation of GPT-2’s WebText.'}
      ]
    },
    tokenizer:{
      widget:'tokenizer',
      inline:[{after:1,src:'inline/tokenizer-stream.svg',alt:'Streaming must not split tokens',caption:'A chunk boundary inside “␠cat” must not change the tokens: carry unfinished pre-tokens forward.'}],
      links:[
        {title:'Tiktokenizer',author:'interactive tool',url:'https://tiktokenizer.vercel.app/',kind:'code',note:'Compare real tokenizers on the same text, including special tokens.'},
        {title:'Unicode HOWTO: encodings and error handlers',author:'Python documentation',url:'https://docs.python.org/3/howto/unicode.html',kind:'article',note:'What errors="replace" does with malformed UTF-8.'}
      ]
    },
    'tokenizer-exp':{
      links:[
        {title:'numpy.memmap',author:'NumPy documentation',url:'https://numpy.org/doc/stable/reference/generated/numpy.memmap.html',kind:'article',note:'Store token IDs on disk and read slices lazily.'}
      ]
    },
    'lm-pipeline':{
      inline:[{after:1,src:'inline/lm-positions.svg',alt:'Every position predicts the next token',caption:'In training every position is scored at once; in generation only the last position’s prediction is used.'}],
      formulaNotes:{U4:[{sym:'d_{\\mathrm{model}}',color:'red',label:'hidden width — every block keeps it'},{sym:'|V|',color:'blue',label:'vocabulary size, fixed by the tokenizer'}]},
      links:[
        {title:'The Illustrated GPT-2',author:'Jay Alammar',url:'https://jalammar.github.io/illustrated-gpt2/',kind:'article',note:'A decoder-only LM drawn stage by stage.'},
        {title:'Transformers, the tech behind LLMs',author:'3Blue1Brown',url:'https://www.youtube.com/watch?v=wjZofJX0v4M',kind:'video',note:'Embeddings, blocks and the unembedding, animated.'}
      ]
    },
    batching:{
      inline:[{after:1,src:'inline/batching-axes.svg',alt:'Only the last axis changes',caption:'A linear layer touches only the feature axis; batch and sequence axes ride along.'}],
      formulaNotes:{1:[{sym:'W^{\\top}',color:'red',label:'row-vector (PyTorch) form'}],2:[{sym:'W',color:'red',label:'stored as (d_out, d_in)'}]},
      links:[
        {title:'torch.einsum',author:'PyTorch documentation',url:'https://pytorch.org/docs/stable/generated/torch.einsum.html',kind:'article',note:'Label axes and let einsum do the contraction.'},
        {title:'Einops tutorial, part 1: basics',author:'einops',url:'https://einops.rocks/1-einops-basics/',kind:'article',note:'Readable reshapes and rearranges with named axes.'}
      ]
    },
    'linear-embedding':{
      widget:'embedding',
      inline:[{after:1,src:'inline/init-truncnormal.svg',alt:'A truncated normal initialization',caption:'Initial weights come from a normal distribution cut at ±3σ; the handout gives σ for each layer type.'}],
      links:[
        {title:'The Illustrated GPT-2 — the embedding matrix',author:'Jay Alammar',url:'https://jalammar.github.io/illustrated-gpt2/',kind:'article',note:'How token IDs become vectors, with pictures.'}
      ]
    },
    rmsnorm:{
      widget:'rmsnorm',
      inline:[{after:1,src:'inline/rmsnorm-dtype.svg',alt:'Upcast before squaring',caption:'Squares overflow low precision quickly; normalize in float32 and cast the result back.'}],
      formulaNotes:{4:[{sym:'\\operatorname{RMS}(a)',color:'blue',label:'one shared scale per position'},{sym:'g_i',color:'red',label:'learned gain, one per feature'}]},
      links:[
        {title:'Root Mean Square Layer Normalization',author:'Zhang & Sennrich, 2019',url:'https://arxiv.org/abs/1910.07467',kind:'paper',note:'Why dropping the mean still works.'},
        {title:'On Layer Normalization in the Transformer Architecture',author:'Xiong et al., 2020',url:'https://arxiv.org/abs/2002.04745',kind:'paper',note:'Why pre-norm trains more stably than post-norm.'}
      ]
    },
    swiglu:{
      widget:'swiglu',
      inline:[{after:0,src:'inline/swiglu-positionwise.svg',alt:'Attention mixes positions, the FFN does not',caption:'The FFN applies the same weights to each position separately; only attention moves information between tokens.'}],
      formulaNotes:{5:[{sym:'\\sigma(x)',color:'blue',label:'sigmoid: a soft 0-to-1 gate'}],7:[{sym:'\\operatorname{SiLU}(W_1x)',color:'gold',label:'gate branch'},{sym:'W_3x',color:'blue',label:'value branch'},{sym:'\\odot',color:'red',label:'elementwise product'},{sym:'W_2',color:'green',label:'project back to d_model'}]},
      links:[
        {title:'GLU Variants Improve Transformer',author:'Noam Shazeer, 2020',url:'https://arxiv.org/abs/2002.05202',kind:'paper',note:'The short paper that introduced SwiGLU.'},
        {title:'Sigmoid-Weighted Linear Units',author:'Elfwing et al., 2017',url:'https://arxiv.org/abs/1702.03118',kind:'paper',note:'Where SiLU comes from.'}
      ]
    },
    rope:{
      widget:'rope',
      inline:[{after:0,src:'inline/rope-blocks.svg',alt:'RoPE is block-diagonal',caption:'The d × d rotation is just d/2 independent 2 × 2 rotations — apply them pairwise, never as a dense matrix.'}],
      formulaNotes:{8:[{sym:'\\theta_{i,k}',color:'red',label:'angle = position i × frequency of pair k'}]},
      links:[
        {title:'Rotary Embeddings: A Relative Revolution',author:'EleutherAI blog',url:'https://blog.eleuther.ai/rotary-embeddings/',kind:'article',note:'Clear derivation with the 2-D intuition.'},
        {title:'RoFormer: Enhanced Transformer with Rotary Position Embedding',author:'Su et al., 2021',url:'https://arxiv.org/abs/2104.09864',kind:'paper',note:'The original RoPE paper.'}
      ]
    },
    mha:{
      figures:[
        {src:'../images/cc/dvgodoy-multihead-chunking.png',alt:'Chunking projections versus chunking inputs',caption:'Right versus wrong way to form heads: project the full input first, then split the projected features into heads (left). Splitting the raw input before projecting (right) would let each head see only part of the token.',credit:dvgodoy('Attention/multihead_chunking.png')}
      ],
      inline:[{after:0,src:'inline/mha-reshape.svg',alt:'Reshape for heads',caption:'View the projected features as (h, d_k) and move the head axis forward so all heads run in one batched matmul.'}],
      formulaNotes:{14:[{sym:'W_O',color:'red',label:'output projection back to d_model'},{sym:'W_Qx,W_Kx,W_Vx',color:'blue',label:'one projection each, then split into heads'}]},
      links:[
        {title:'Attention in transformers, step-by-step',author:'3Blue1Brown',url:'https://www.youtube.com/watch?v=eMlx5fFNoYc',kind:'video',note:'Multiple heads and what they might learn.'},
        {title:'Attention Is All You Need',author:'Vaswani et al., 2017',url:'https://arxiv.org/abs/1706.03762',kind:'paper',note:'Section 3.2.2 defines multi-head attention.'}
      ]
    },
    'full-lm':{
      figures:[
        {src:'../images/cc/dvgodoy-norm-first-sublayer.png',alt:'Norm-first sublayer wrapper',caption:'The pre-norm (“norm-first”) wrapper around each sublayer: normalize, apply the sublayer, add back to the residual. This drawing also has dropout, which the assignment’s block does not use; your norm is RMSNorm.',credit:dvgodoy('Transformers/norm_first.png')}
      ],
      inline:[{after:1,src:'inline/flops-2mnp.svg',alt:'Why a matmul costs 2mnp FLOPs',caption:'Every output entry is a length-n dot product: n multiplies plus about n adds.'}],
      formulaNotes:{15:[{sym:'x+',color:'blue',label:'residual: the input skips around'},{sym:'\\operatorname{RMSNorm}(x)',color:'green',label:'pre-norm: normalize the sublayer input'}],U5:[{sym:'2mnp',color:'red',label:'multiply + add per inner-product term'}]},
      links:[
        {title:'Scaling Laws for Neural Language Models',author:'Kaplan et al., 2020',url:'https://arxiv.org/abs/2001.08361',kind:'paper',note:'Section 2.1 counts parameters and FLOPs per token.'},
        {title:'On Layer Normalization in the Transformer Architecture',author:'Xiong et al., 2020',url:'https://arxiv.org/abs/2002.04745',kind:'paper',note:'Pre-norm versus post-norm, with the math.'}
      ]
    },
    sgd:{
      figures:[
        {src:'../images/cc/dvgodoy-gradient-descent-paths.png',alt:'Batch, mini-batch and stochastic gradient descent paths',caption:'Three ways to estimate the gradient on a 2-parameter problem: the full batch (smooth), mini-batches (slightly noisy), single examples (very noisy). Your LM trains with mini-batches B_t.',credit:dvgodoy('Gradient Descent/paths.png')}
      ],
      inline:[{after:1,src:'inline/sgd-decay.svg',alt:'The toy SGD schedule',caption:'In the handout’s toy example the step size shrinks as 1/√(t+1).'}],
      formulaNotes:{19:[{sym:'\\alpha_t',color:'gold',label:'step size (learning rate)'},{sym:'\\nabla L(\\theta_t;B_t)',color:'blue',label:'gradient estimated on this batch'}],20:[{sym:'\\frac{\\alpha}{\\sqrt{t+1}}',color:'gold',label:'a step size that decays with t'}]},
      links:[
        {title:'An overview of gradient descent optimization algorithms',author:'Sebastian Ruder',url:'https://www.ruder.io/optimizing-gradient-descent/',kind:'article',note:'SGD, momentum, Adam and friends in one readable page.'},
        {title:'Why Momentum Really Works',author:'Gabriel Goh · Distill',url:'https://distill.pub/2017/momentum/',kind:'article',note:'Interactive plots of step size and curvature.'}
      ]
    },
    adamw:{
      widget:'optimizer',
      figures:[
        {src:'../images/cc/dvgodoy-sgd-adam-paths.png',alt:'SGD and Adam paths on a loss surface',caption:'SGD and Adam from the same start on the same loss contours: Adam’s per-parameter scaling changes the route it takes to the minimum.',credit:dvgodoy('Optimizers and Schedulers/sgd_adam_paths.png')}
      ],
      inline:[{after:0,src:'inline/adamw-bias.svg',alt:'Why bias correction',caption:'Both moments start at zero; dividing by (1 − βᵗ) removes that early bias.'}],
      formulaNotes:{U6:[{sym:'\\beta_1m_{t-1}',color:'red',label:'keep most of the old memory'},{sym:'(1-\\beta_1)g_t',color:'blue',label:'mix in the new gradient'}],U7:[{sym:'g_t^2',color:'gold',label:'squared: magnitude only'}],U8:[{sym:'\\frac{\\sqrt{1-\\beta_2^t}}{1-\\beta_1^t}',color:'green',label:'bias correction → 1 as t grows'}]},
      links:[
        {title:'Decoupled Weight Decay Regularization (AdamW)',author:'Loshchilov & Hutter, 2019',url:'https://arxiv.org/abs/1711.05101',kind:'paper',note:'Why weight decay should be separate from the adaptive step.'},
        {title:'Adam: A Method for Stochastic Optimization',author:'Kingma & Ba, 2015',url:'https://arxiv.org/abs/1412.6980',kind:'paper',note:'Algorithm 1 and the bias-correction derivation.'}
      ]
    },
    schedule:{
      widget:'schedule',
      inline:[{after:1,src:'inline/schedule-boundaries.svg',alt:'Boundary checks',caption:'Four values to check before any long run.'}],
      formulaNotes:{U9:[{sym:'\\frac{t}{T_w}\\alpha_{\\max}',color:'gold',label:'linear warmup'},{sym:'\\cos\\!\\left(\\pi\\frac{t-T_w}{T_c-T_w}\\right)',color:'blue',label:'cosine phase: 1 → −1 across [T_w, T_c]'},{sym:'\\alpha_{\\min},&t>T_c',color:'green',label:'hold at the minimum'}]},
      links:[
        {title:'SGDR: Stochastic Gradient Descent with Warm Restarts',author:'Loshchilov & Hutter, 2017',url:'https://arxiv.org/abs/1608.03983',kind:'paper',note:'Where cosine annealing comes from.'},
        {title:'Deep Learning Tuning Playbook',author:'Google Research',url:'https://github.com/google-research/tuning_playbook',kind:'article',note:'Practical advice on schedules and learning-rate tuning.'}
      ]
    },
    clipping:{
      widget:'clipping',
      inline:[{after:1,src:'inline/clipping-global.svg',alt:'Global versus per-parameter clipping',caption:'Global clipping scales every gradient by the same factor, so the update direction is preserved.'}],
      formulaNotes:{U10:[{sym:'\\|g\\|_2',color:'blue',label:'one norm over all parameters'},{sym:'\\min\\!\\left(1,\\frac{M}{\\|g\\|_2+\\epsilon}\\right)',color:'red',label:'one shared scale, never above 1'}]},
      links:[
        {title:'On the difficulty of training Recurrent Neural Networks',author:'Pascanu et al., 2013',url:'https://arxiv.org/abs/1211.5063',kind:'paper',note:'The paper that popularized gradient-norm clipping.'},
        {title:'torch.nn.utils.clip_grad_norm_',author:'PyTorch documentation',url:'https://pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html',kind:'article',note:'The reference behaviour the tests compare against.'}
      ]
    },
    data:{
      widget:'batch',
      inline:[{after:1,src:'inline/data-memmap.svg',alt:'Memory-mapped token arrays',caption:'The corpus stays on disk; only sampled windows are read and moved to the device.'}],
      formulaNotes:{U11:[{sym:'x_{s_b:s_b+T}',color:'blue',label:'input window of length T'},{sym:'x_{s_b+1:s_b+T+1}',color:'red',label:'target: same window, one step later'}]},
      links:[
        {title:'numpy.memmap',author:'NumPy documentation',url:'https://numpy.org/doc/stable/reference/generated/numpy.memmap.html',kind:'article',note:'Lazy, disk-backed arrays.'}
      ]
    },
    checkpoint:{
      inline:[{after:1,src:'inline/checkpoint-resume.svg',alt:'Resuming correctly',caption:'Schematic: resuming without optimizer state and step count typically shows up as a bump in the loss.'}],
      formulaNotes:{U0e:[{sym:'\\theta_t',color:'blue',label:'model weights'},{sym:'S_{\\mathrm{optimizer},t}',color:'gold',label:'AdamW moments + step'}]},
      links:[
        {title:'Saving and Loading Models',author:'PyTorch tutorials',url:'https://pytorch.org/tutorials/beginner/saving_loading_models.html',kind:'article',note:'state_dict for models and optimizers.'}
      ]
    },
    'train-loop':{
      inline:[{after:1,src:'inline/train-overfit.svg',alt:'Overfit a single batch',caption:'Schematic: a correct pipeline can memorize one batch; a loss stuck near log|V| points to a bug.'}],
      formulaNotes:{U12:[{sym:'N_{\\mathrm{steps}}',color:'gold',label:'optimizer steps'}]},
      links:[
        {title:'A Recipe for Training Neural Networks',author:'Andrej Karpathy',url:'https://karpathy.github.io/2019/04/25/recipe/',kind:'article',note:'Overfit one batch, visualize, then scale up.'},
        {title:'Deep Learning Tuning Playbook',author:'Google Research',url:'https://github.com/google-research/tuning_playbook',kind:'article',note:'How to organize runs and compare them fairly.'}
      ]
    },
    generation:{
      widget:'sampling',
      inline:[{after:1,src:'inline/generation-topp.svg',alt:'Top-p as a cumulative cut',caption:'Sort, accumulate, stop at p, renormalize.'}],
      formulaNotes:{23:[{sym:'v_i/\\tau',color:'red',label:'temperature divides every logit'}],24:[{sym:'\\sum_{j\\in V(p)}q_j',color:'blue',label:'renormalize over the kept set'}]},
      links:[
        {title:'How to generate text',author:'Hugging Face blog',url:'https://huggingface.co/blog/how-to-generate',kind:'article',note:'Greedy, beam, temperature, top-k and top-p compared.'},
        {title:'The Curious Case of Neural Text Degeneration',author:'Holtzman et al., 2020',url:'https://arxiv.org/abs/1904.09751',kind:'paper',note:'The paper that introduced nucleus (top-p) sampling.'}
      ]
    },
    'experiment-log':{
      inline:[{after:0,src:'inline/experiment-record.svg',alt:'A run record',caption:'A template for what every run should record.'}],
      links:[
        {title:'Deep Learning Tuning Playbook',author:'Google Research',url:'https://github.com/google-research/tuning_playbook',kind:'article',note:'Scientific versus nuisance hyperparameters; fair comparisons.'},
        {title:'A Recipe for Training Neural Networks',author:'Andrej Karpathy',url:'https://karpathy.github.io/2019/04/25/recipe/',kind:'article',note:'Habits that make runs interpretable.'}
      ]
    },
    tinystories:{
      widget:'lr-sweep',
      links:[
        {title:'TinyStories: How Small Can Language Models Be…',author:'Eldan & Li, 2023',url:'https://arxiv.org/abs/2305.07759',kind:'paper',note:'What small models can learn from simple stories.'},
        {title:'Deep Learning Tuning Playbook',author:'Google Research',url:'https://github.com/google-research/tuning_playbook',kind:'article',note:'How to run and read a learning-rate sweep.'}
      ]
    },
    ablations:{
      formulaNotes:{25:[{sym:'\\operatorname{RMSNorm}(x)',color:'green',label:'pre-norm: normalize the input'}],27:[{sym:'\\operatorname{RMSNorm}(x+\\operatorname{MHSA}(x))',color:'gold',label:'post-norm: normalize after the add'}],29:[{sym:'\\operatorname{SiLU}(W_1x)',color:'gold',label:'no gate: a plain activation'}]},
      links:[
        {title:'On Layer Normalization in the Transformer Architecture',author:'Xiong et al., 2020',url:'https://arxiv.org/abs/2002.04745',kind:'paper',note:'Pre-norm versus post-norm.'},
        {title:'GLU Variants Improve Transformer',author:'Noam Shazeer, 2020',url:'https://arxiv.org/abs/2002.05202',kind:'paper',note:'SwiGLU versus plain FFNs at matched parameters.'},
        {title:'RoFormer',author:'Su et al., 2021',url:'https://arxiv.org/abs/2104.09864',kind:'paper',note:'What RoPE adds over no explicit position.'}
      ]
    },
    owt:{
      links:[
        {title:'OpenWebText corpus',author:'Gokaslan & Cohen',url:'https://skylion007.github.io/OpenWebTextCorpus/',kind:'article',note:'What is in the data.'},
        {title:'Language Models are Unsupervised Multitask Learners (GPT-2)',author:'Radford et al., 2019',url:'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf',kind:'paper',note:'The WebText recipe OpenWebText re-creates.'}
      ]
    },
    leaderboard:{
      widget:'audit',
      links:[
        {title:'stanford-cs336/assignment1-basics',author:'Stanford CS336',url:'https://github.com/stanford-cs336/assignment1-basics',kind:'code',note:'The official repository: handout, tests and submission script.'},
        {title:'Stanford CS336: Language Modeling from Scratch',author:'Course website',url:'https://cs336.stanford.edu/',kind:'article',note:'Deadlines, policies and the leaderboard.'}
      ]
    },
    'cross-entropy':{
      widget:'cross-entropy',
      inline:[
        {after:0,src:'inline/ce-shift.svg',alt:'Targets shifted by one token',caption:'Every position is a training example: the target is simply the next input token.'},
        {after:1,src:'inline/ce-logsumexp.svg',alt:'Naive versus stable cross-entropy',caption:'Subtracting the largest logit changes nothing mathematically but keeps every exponent ≤ 0.'}
      ],
      formulaNotes:{
        16:[{sym:'-\\log p_{\\theta}(x_{i+1}\\mid x_{1:i})',color:'red',label:'surprise of the true next token'},{sym:'\\frac{1}{|D|m}',color:'blue',label:'average over every predicted position'}],
        17:[{sym:'e^{o_i[x_{i+1}]}',color:'red',label:'only the target token’s logit'},{sym:'\\sum_{a=1}^{|V|}e^{o_i[a]}',color:'blue',label:'normalizer over all |V| logits'}],
        18:[{sym:'\\exp',color:'green',label:'undo the log → “effective choices”'},{sym:'\\frac{1}{m}\\sum_{i=1}^{m}\\ell_i',color:'blue',label:'mean per-token loss (nats)'}]
      },
      links:[
        {title:'Visual Information Theory',author:'Chris Olah',url:'https://colah.github.io/posts/2015-09-Visual-Information/',kind:'article',note:'Entropy and cross-entropy drawn as code lengths.'},
        {title:'Perplexity of fixed-length models',author:'Hugging Face docs',url:'https://huggingface.co/docs/transformers/perplexity',kind:'article',note:'How PPL is computed in practice, with sliding windows.'},
        {title:'Let’s build GPT: from scratch, in code, spelled out',author:'Andrej Karpathy',url:'https://www.youtube.com/watch?v=kCc8FmEb1nY',kind:'video',note:'Watch the loss start near log |V| and fall.'}
      ]
    },
    attention:{
      widget:'attention',
      figures:[
        {src:'../images/cc/dvgodoy-masked-self-attention.png',alt:'Masked self-attention data flow for two tokens',caption:'Another view of masked self-attention on a two-token example: the query (red) is scored against each key, the alignment scores weight the values, and the weighted sum becomes the context vector. Drawn for a small encoder–decoder model with one position at a time; your implementation computes all positions at once as matrices.',credit:dvgodoy('Attention/decoder_self.png')}
      ],
      inline:[
        {after:0,src:'inline/attn-dot.svg',alt:'Dot product as similarity',caption:'A score is large when a query and key point the same way, zero when unrelated, negative when opposed.'},
        {after:1,src:'inline/attn-mask-order.svg',alt:'Masking before versus after softmax',caption:'Masking must happen on scores. −∞ becomes exactly 0 after exp, and the remaining weights still sum to 1.'}
      ],
      formulaNotes:{
        10:[{sym:'e^{v_i}',color:'red',label:'this entry, made positive'},{sym:'\\sum_{j=1}^{n}e^{v_j}',color:'blue',label:'sum over the normalized (key) axis'}],
        11:[{sym:'QK^{\\top}',color:'blue',label:'every query · every key → n×m scores'},{sym:'\\sqrt{d_k}',color:'gold',label:'keeps score variance ≈ 1'},{sym:'V',after:'\\right)',color:'green',label:'values mixed by the weights → n×d_v'}]
      },
      links:[
        {title:'Attention in transformers, step-by-step',author:'3Blue1Brown',url:'https://www.youtube.com/watch?v=eMlx5fFNoYc',kind:'video',note:'Animated queries, keys, values and masking.'},
        {title:'The Illustrated GPT-2',author:'Jay Alammar',url:'https://jalammar.github.io/illustrated-gpt2/',kind:'article',note:'Masked self-attention in a decoder-only model.'},
        {title:'The Illustrated Transformer',author:'Jay Alammar',url:'https://jalammar.github.io/illustrated-transformer/',kind:'article',note:'The classic picture-by-picture walkthrough.'},
        {title:'Attention Is All You Need',author:'Vaswani et al., 2017',url:'https://arxiv.org/abs/1706.03762',kind:'paper',note:'Section 3.2 defines scaled dot-product attention.'}
      ]
    }
  };
})();
