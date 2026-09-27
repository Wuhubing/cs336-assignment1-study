/* Study tasks and progressive hints. These are conceptual outlines, not submitted solutions. */
(()=>{
  const G=(scope,tasks,principle,pseudocode)=>({scope,tasks,principle,pseudocode});
  window.STUDY_GUIDES={
    orientation:G(
      "Planning · no graded code in §1",
      ["Map the code you will own under cs336_basics/: tokenizer, model, optimizer, data, training, and generation.","Keep tests/adapters.py as the thin connection between your modules and the staff tests; list the output artifacts separately from the code."],
      "Treat each component as a contract with clear inputs, outputs, and tests. The training pipeline only works when its interfaces agree.",
      ["LIST required components and written deliverables","GROUP components by data flow","ASSIGN each component an interface and a test","CONNECT components only after their local contracts are clear"]),
    unicode:G(
      "Written response · optional scratch probe",
      ["No package implementation is required here. Use a tiny disposable probe, if helpful, to inspect characters, code points, and printed representations for the handout question.","Write your own observation for Problem unicode1 in the writeup."],
      "The stored code point and what a terminal displays are different layers. A control character can affect output without drawing a glyph.",
      ["CHOOSE the characters in the handout example","OBSERVE each code point and its representation","COMPARE representation with visible output","EXPLAIN the difference in your own words"]),
    utf8:G(
      "Written response · optional scratch probe",
      ["No package implementation is required here. Inspect how selected text becomes UTF-8 bytes and how byte length differs from character count.","Record the requested reasoning for Problem unicode2 in the writeup."],
      "UTF-8 represents Unicode scalar values with variable-length byte sequences; the byte alphabet itself has 256 possible values.",
      ["SELECT short text examples","ENCODE each example as UTF-8","COMPARE code points, bytes, and visible characters","CHECK the reversibility and the boundary case asked in the PDF"]),
    subword:G(
      "Design note · no graded code in §2.3",
      ["Sketch the tokenizer interface you will later implement: train vocabulary, encode text, decode IDs.","Write down which measurements change when the vocabulary size changes."],
      "Subwords trade a larger vocabulary for shorter token sequences. The tokenizer defines the units on which model loss is measured.",
      ["INPUT text and a chosen vocabulary","MAP text into reusable byte spans","MEASURE sequence length and vocabulary size","COMPARE the tradeoff before choosing settings"]),
    "bpe-train":G(
      "Implementation · train_bpe / run_train_bpe",
      ["Implement byte-level BPE training in your own cs336_basics module.","Connect the implementation through run_train_bpe in tests/adapters.py; return the vocabulary and ordered merge list expected by the adapter.","Check special-token boundaries, tie behavior, vocabulary budget, and the training test."],
      "Merge history is ordered. Pair statistics belong within pre-token boundaries, and special tokens must not become ordinary adjacent bytes.",
      ["INPUT corpus, target vocabulary size, special tokens","FORM boundary-aware pre-token byte sequences","REPEAT: inspect allowed adjacent-pair counts; record one merge; update affected sequences","OUTPUT vocabulary and merge history in order"]),
    "bpe-runs":G(
      "Experiment code · tokenizer training runs",
      ["Write a repeatable runner for the TinyStories and OpenWebText BPE settings in §2.5.","Save the resulting vocabulary and merges and record elapsed time, peak memory, and token diagnostics for the writeup."],
      "The two corpora have different distributions. Make the run configuration and measurements explicit before interpreting their learned vocabularies.",
      ["FOR each corpus and required vocabulary budget","RUN the same training interface","SAVE vocabulary, merges, timing, and memory observations","COMPARE representative learned tokens"]),
    tokenizer:G(
      "Implementation · get_tokenizer adapter",
      ["Implement tokenizer construction plus encode, encode_iterable, and decode behavior in your own module.","Wire get_tokenizer in tests/adapters.py to your class or object.","Check special-token handling, merge order, Unicode round trips, and streaming consistency."],
      "Encoding must respect the learned merge rank and special-token spans. Decoding reconstructs bytes before interpreting UTF-8.",
      ["INPUT text or text chunks","SEPARATE special spans from ordinary text","TOKENIZE ordinary spans using pre-tokens and learned merge order","MAP final units to IDs; for decoding, reverse IDs to bytes then text"]),
    "tokenizer-exp":G(
      "Experiment code · tokenizer benchmark and data encoding",
      ["Write a script that samples both corpora, compares bytes per token, and measures encoding throughput.","Encode train and validation splits into token-ID arrays with a dtype that can hold every vocabulary ID.","Record corpus, tokenizer, sample size, and timing method."],
      "Compression and throughput are different properties. A byte count and token count must describe the same input sample.",
      ["FOR each corpus–tokenizer pairing","ENCODE a documented sample","RECORD bytes, token count, and elapsed time","ENCODE full splits with a safe integer dtype and save provenance"]),
    "lm-pipeline":G(
      "Architecture sketch · no separate graded function",
      ["Define the planned TransformerLM module boundaries before wiring them together: embedding, repeated blocks, final normalization, and vocabulary projection.","Write the expected shape at each boundary; the full implementation is tested in §3.5."],
      "The residual stream keeps shape (batch, sequence, model width). The final projection changes only the last axis to vocabulary size.",
      ["INPUT token-ID tensor","LOOK UP token vectors","PASS features through repeated shape-preserving blocks","PROJECT final features to vocabulary logits"]),
    batching:G(
      "Shape exercise · no separate graded function",
      ["Make a small shape table for batched matrix multiplication, heads, and sequence axes before implementing attention.","Use a disposable tensor probe if needed; keep the actual data loader for §5.1."],
      "Batch dimensions travel alongside the feature computation. Most attention mistakes are axis mistakes rather than errors in the scalar formula.",
      ["NAME batch, sequence, head, and feature axes","TRACE each operation through a small symbolic shape","CHECK which axes contract and which survive","USE the result when designing the module interface"]),
    "linear-embedding":G(
      "Implementation · run_linear / run_embedding",
      ["Write bias-free Linear and token Embedding modules in cs336_basics.","Connect run_linear and run_embedding in tests/adapters.py so supplied weights and inputs reach your modules.","Check output shapes and the weight orientation specified by the adapters."],
      "A Linear map transforms a feature axis; an Embedding selects rows by integer IDs. They use weights differently even when they can be described with matrices.",
      ["LINEAR: accept features and a weight matrix; preserve leading axes","EMBEDDING: accept IDs and a vocabulary table; append model-width axis","COMPARE outputs and stored-weight shapes with adapter contracts"]),
    rmsnorm:G(
      "Implementation · run_rmsnorm",
      ["Write an RMSNorm module with a learned scale and epsilon for numerical stability.","Wire run_rmsnorm in tests/adapters.py to pass the supplied weights and inputs.","Verify arbitrary leading dimensions and feature-axis behavior."],
      "RMSNorm rescales by the root mean square over the final feature axis, then applies a learned per-feature scale.",
      ["INPUT features and scale vector","MEASURE squared magnitude along the feature axis","NORMALIZE with epsilon in the denominator path","APPLY scale while preserving input shape"]),
    swiglu:G(
      "Implementation · run_silu / run_swiglu",
      ["Write SiLU and the SwiGLU position-wise feed-forward block.","Connect run_silu and run_swiglu in tests/adapters.py; track the two expansion paths and final projection weights.","Check that the block returns the residual-stream width."],
      "The gate modulates one expanded branch with another. The operation is position-wise: it changes features but does not mix token positions.",
      ["INPUT model-width features","CREATE the two expanded feature paths","APPLY SiLU and gate them elementwise","PROJECT back to model width"]),
    rope:G(
      "Implementation · run_rope",
      ["Write RoPE for query/key head features and token positions.","Wire run_rope in tests/adapters.py; keep position handling compatible with batch and sequence axes.","Check even-dimensional pairs, cache bounds, and a simple position-zero invariant."],
      "RoPE rotates coordinate pairs by a position-dependent angle. Rotation changes orientation while preserving each pair's magnitude.",
      ["INPUT head features and token positions","PAIR adjacent feature coordinates","LOOK UP or derive the angle for each pair and position","ROTATE each pair and restore the original tensor shape"]),
    attention:G(
      "Implementation · run_softmax / run_scaled_dot_product_attention",
      ["Write numerically stable softmax along a selected axis.","Write scaled dot-product attention with an optional mask and wire both adapters.","Verify broadcasting, masked positions, and query/key/value output shapes."],
      "Scores compare queries with keys; the mask removes disallowed keys before normalization; normalized weights mix values.",
      ["FORM query–key scores and apply the scale","EXCLUDE positions indicated by the mask","NORMALIZE scores along the key axis","WEIGHT value vectors and preserve query positions"]),
    mha:G(
      "Implementation · both multi-head attention adapters",
      ["Write causal multi-head self-attention with shared Q/K/V projection matrices and an output projection.","Support the versions with and without RoPE; connect run_multihead_self_attention and run_multihead_self_attention_with_rope.","Check head-width divisibility, causal masking, and the residual-stream output shape."],
      "Each head attends over its own feature slice. The same causal rule applies to every head, and RoPE acts on query/key head features.",
      ["PROJECT input to query, key, and value features","ORGANIZE features by head; optionally rotate query/key","APPLY causal attention independently per head","JOIN head outputs and project to model width"]),
    "full-lm":G(
      "Implementation · run_transformer_block / run_transformer_lm",
      ["Write the pre-norm Transformer block and the full decoder-only TransformerLM.","Wire the two adapters to your modules and align state-dictionary names and shapes with the supplied contracts.","Complete the separate parameter, memory, and FLOP accounting response."],
      "Residual branches preserve model width. The complete model maps token IDs to logits at every sequence position.",
      ["INPUT token IDs; obtain embeddings","REPEAT pre-norm attention and feed-forward residual branches","APPLY final normalization and vocabulary projection","ACCOUNT for parameters and compute separately from the forward pass"]),
    "cross-entropy":G(
      "Implementation · run_cross_entropy",
      ["Write a cross-entropy function for batched logits and target IDs.","Wire run_cross_entropy in tests/adapters.py and check it returns a scalar mean loss.","Inspect numerical stability for large logit magnitudes."],
      "The target logit is compared with a normalization over the vocabulary. A stable log-sum-exp form avoids overflow.",
      ["INPUT logits and target IDs","COMPUTE a stable per-example log normalization","COMPARE each target score with that normalization","AVERAGE per-example losses"]),
    sgd:G(
      "Experiment code · toy optimizer from the handout",
      ["Run the handout's provided toy SGD example with the requested learning rates and iteration count.","Record the observed loss behavior in the writeup; this lesson does not require a new staff-tested adapter."],
      "Step size determines how far a local gradient direction moves parameters. A step can overshoot even if the initial direction is downhill.",
      ["FOR each requested learning rate","RESET to the same initial conditions","RUN the short toy optimization and record loss by step","DESCRIBE the observed trend without assuming the result"]),
    adamw:G(
      "Implementation · get_adamw_cls",
      ["Write an AdamW optimizer class derived from the PyTorch Optimizer interface.","Return your class from get_adamw_cls in tests/adapters.py and test state, parameter groups, and updates.","Answer the separate memory/runtime accounting prompt."],
      "The optimizer keeps first and second moment state for each parameter. Weight decay is applied separately from the adaptive gradient path.",
      ["INITIALIZE hyperparameters and per-parameter state","FOR each update, observe available gradients","UPDATE moment estimates and account for their initial bias","APPLY the adaptive parameter change and separate weight decay"]),
    schedule:G(
      "Implementation · run_get_lr_cosine_schedule",
      ["Write the learning-rate schedule with warmup, cosine decay, and minimum-rate hold.","Wire run_get_lr_cosine_schedule to your function and check phase boundaries explicitly."],
      "A schedule is a function of iteration and phase boundaries. Continuity and the exact endpoint matter more than an approximate curve shape.",
      ["INPUT iteration and schedule parameters","IDENTIFY warmup, cosine, or final-hold phase","EVALUATE the phase's learning-rate relation","CHECK the transition iterations"]),
    clipping:G(
      "Implementation · run_gradient_clipping",
      ["Write gradient clipping across the combined parameter-gradient L2 norm.","Wire run_gradient_clipping and modify gradients in place only when the norm exceeds the threshold.","Check missing gradients and zero/near-zero norms."],
      "The limit applies to the norm of the whole gradient collection, not a separate limit for each tensor.",
      ["GATHER existing gradients","MEASURE one combined L2 norm","IF it exceeds the threshold, derive a shared scale","APPLY that scale to existing gradients"]),
    data:G(
      "Implementation · run_get_batch",
      ["Write a batch sampler from a 1D token-ID array, with next-token targets shifted by one position.","Wire run_get_batch; return two integer tensors of shape (batch size, context length) on the requested device.","Check start-index boundaries and train/validation separation."],
      "Input and target are adjacent windows over the same token stream. The final target must remain inside the array.",
      ["INPUT token array, batch size, context length, device","CHOOSE valid window starts","FORM input windows and one-step-shifted target windows","RETURN both batches with matching shapes and device"]),
    checkpoint:G(
      "Implementation · run_save_checkpoint / run_load_checkpoint",
      ["Write save and load utilities for model state, optimizer state, and iteration.","Connect both checkpoint adapters; support the path or binary stream forms in their signatures.","Verify resumed weights, optimizer state, and next schedule position."],
      "A restartable run needs optimizer memories and its iteration count as well as model weights.",
      ["SAVE model state, optimizer state, and iteration together","LOAD the stored payload into the supplied objects","RETURN the stored iteration","CHECK that a resumed run continues from the expected state"]),
    "train-loop":G(
      "Integration code · configurable training script",
      ["Write a training driver using your tokenizer data, model, loss, AdamW, schedule, clipping, and batch sampler.","Allow configurable hyperparameters, memory-efficient train/validation loading, checkpoint paths, and periodic metrics.","Run a short end-to-end smoke test before an expensive experiment."],
      "A training step changes weights; a validation step measures them without changing them. Logs need both step and wall-clock coordinates.",
      ["LOAD configuration, datasets, model, optimizer, and optional checkpoint","REPEAT: sample train batch; evaluate loss; update parameters","PERIODICALLY measure validation, log metrics, and save checkpoint","STOP after the configured budget"]),
    generation:G(
      "Implementation · decoding function",
      ["Write text generation from a user prompt using your trained LM and tokenizer.","Support maximum new tokens, temperature, top-p sampling, and end-token stopping as requested in §6.","Record settings and seed alongside generated samples."],
      "The final-position logits predict only the next token. Sampling feeds the chosen token back into the next model input.",
      ["ENCODE the prompt","REPEAT until stop: read final-position logits; adjust the sampling distribution; choose one ID","APPEND the ID and check end/length conditions","DECODE the accumulated IDs"]),
    "experiment-log":G(
      "Experiment code · logging and plotting",
      ["Create logging infrastructure that records run configuration, gradient step, wall-clock time, training loss, and validation loss.","Write a plot/report path that produces curves against both steps and elapsed time.","Keep a human-readable experiment log for later comparisons."],
      "A metric without its run configuration and time axis is hard to interpret. Separate measurement from presentation so raw observations remain available.",
      ["AT run start, record configuration and provenance","AT each logging point, record step, time, and metrics","PERSIST raw observations","PLOT comparable curves on step and time axes"]),
    tinystories:G(
      "Experiment code · TinyStories runs",
      ["Configure repeatable TinyStories training runs with the handout baseline architecture and token budget.","Run the requested learning-rate and batch-size comparisons; save curves, validation results, and generated samples.","Keep decoder settings tied to each sampled checkpoint."],
      "Change one experimental factor deliberately and compare at a fair token/time budget. Qualitative text samples complement, but do not replace, validation curves.",
      ["DEFINE a baseline configuration and evaluation protocol","RUN the requested controlled variations","RECORD curves, checkpoints, and generation settings","COMPARE observed behavior in the writeup"]),
    ablations:G(
      "Experiment code · architecture switches",
      ["Make controlled model variants for the four §7.3 ablations: RMSNorm removal, post-norm, NoPE, and SiLU FFN.","Run paired comparisons with documented settings and curves.","Keep the rest of the configuration aligned with the handout's comparison rules."],
      "An ablation only supports a causal interpretation when the changed component and any required parameter-budget adjustment are clear.",
      ["START from a saved baseline configuration","CHANGE one requested architecture choice","TRAIN and evaluate under documented conditions","COMPARE each variant with its appropriate baseline"]),
    owt:G(
      "Experiment code · OpenWebText run",
      ["Reuse the training and generation pipeline with the OpenWebText tokenizer and encoded splits.","Run the architecture and iteration comparison requested in §7.4; save the learning curve and generated samples.","Document any necessary hyperparameter retuning."],
      "Corpus and tokenizer differ from TinyStories, so token-level losses and sample fluency need context when compared.",
      ["LOAD the OWT tokenizer and matching token arrays","CONFIGURE the requested architecture and run budget","TRAIN, validate, log, and sample text","COMPARE with TinyStories using explicit assumptions"]),
    leaderboard:G(
      "Run and submission code · final audit",
      ["Prepare a reproducible leaderboard run using only the permitted OpenWebText training data and the current time limit.","Record final validation loss, a wall-clock learning curve, and the model changes you tried.","Build the course submission artifacts and audit all numbered Problems against the official handout."],
      "The leaderboard is an experiment under a fixed resource constraint. Small pilot runs can test an idea before the final timed run.",
      ["VERIFY current leaderboard rules","PILOT a documented modification on a smaller run","RUN the selected configuration within the stated budget","AUDIT curve, writeup, code archive, and submission instructions"])
  };
})();
