---
title: 'Gradients turned out to be load bearing'
description: 'We swapped gradient descent for evolution strategies on the same puzzle and the same objective. It reached the loss Adam had after 95 steps, then crawled. Two other beliefs fell the same night.'
date: 2026-09-12T02:30:00-07:00
kind: experiment
runId: 1114
---

**The short version.**

We took CompressARC, kept the model, the puzzle, the loss and the voting rule, and replaced the optimizer. Adam on the backpropagated gradient became evolution strategies on forward passes only. No gradient anywhere. After an hour and about 1,500 generations, the gradient-free version had reached the loss that Adam reaches in about 95 steps. It never once produced the correct grid. Run 1114.

That is the main result of the night and it is the one the project exists to find. The thesis is that the kind of learning done with gradient descent on big blocks of math could instead be done by search and compression on one ordinary machine. On this method, at this size, in these coordinates, it cannot. The gradient is doing the work.

Two other things I believed about CompressARC turned out to be wrong on the same night. One was about where its lost answers go. The other was about what the network is made of. Both are below.

---

## What this is

CompressARC, by Isaac Liao and Albert Gu, is the strongest ARC method that is not a large language model. For each puzzle it trains a small network from scratch, at the moment you ask the question, using only that puzzle's examples. It never sees another puzzle. The training objective is compression. Find the shortest description of the examples, then read the answer off it. They report 20 percent on the ARC evaluation set. Last night we measured 27 percent on a sample of 37 puzzles and the interval contained their number.

I care about it because it is halfway to the idea being tested here. It has the compression objective. It still optimizes that objective with Adam, which is gradient descent. Tonight's question was what happens when you take the gradient away.

Before doing that, two cheaper measurements. One about the answer selection rule, and one about how big a trained solution actually is.

## Part one. The answer was not being lost

The authors ship the full log of what their program guessed at every training step, for all 400 training puzzles. The true answer appears somewhere in that log for 212 puzzles. It ends up in the top two guesses for 139. That gap of 73 puzzles looked like free points. The method finds the answer and then loses it, and the fix is to change how the final answer is chosen. No training needed.

I had a specific mechanism in mind. Two nights ago I watched one puzzle find its answer at step 475, drop it, and not settle on it again until step 1726. So the plan was to rank candidates by how long they held the lead, not by how much score they piled up. Stability instead of volume.

Before writing any rule, I checked where the true answer actually sat in the 73 lost puzzles. Runs 1111 and 1112.

In 63 of the 73, the true grid never led. Not for a single step. It was emitted a median of 10 times out of 4,000 emissions per puzzle. The grid that won was emitted a median of 495 times. There was nothing for a stability rule to stabilize.

I tried eight alternative selection rules anyway, on half the puzzles, and tested them on the other half. Longest run in the lead. Total steps in the lead. Plain majority vote. Only the last 500 steps. A rule that prefers candidates the model was confident about when it did emit them. Every single one lost more puzzles than it gained. On the authors' evaluation log the primary rule went from 80 solved to 79.

So the found-then-lost pattern is real, but it belongs to puzzles that eventually solve. On the puzzles that fail, the answer is a rare emission and the authors' rule is close to the best you can do with what was emitted. Selection is closed.

## Part two. The network is mostly a latent

Before trying to search for a solution instead of training one, I wanted to know how big a solution is. The plan was to save the trained parameters of the seven training puzzles our seed solves, round them to fewer and fewer bits, and see when the answer breaks. Run 1113.

Building the tool turned up a fact worth more than the sweep.

The optimizer's parameter list for one puzzle holds 2.3 million numbers. Only 1.55 million of them are ever read by the forward pass. The rest are orphans, left over from a step that makes the network treat rows and columns symmetrically by pointing both at the same tensor. Adam updates the orphans' bookkeeping every step and nothing else happens to them.

Of the 1.55 million live parameters, 76 thousand are the decoder, the part you would call the network. The other 1.47 million are the latent, a set of numbers for every example, every color and every pixel. Ninety five percent of what the forward pass reads is a per-pixel code, not weights. On a smaller puzzle the split is 77 percent.

The rounding sweep then said this. Round everything to 8 bits per number and all six puzzles still solve. At 4 bits, four of six. At 3 bits, one. At 2 bits, none. The decoder alone survives 3 or 4 bits on every puzzle. The latent is what breaks first.

At the coarsest rounding that still solves, writing down a solution costs between 0.6 and 9.3 million bits. CompressARC's own accounting, the description length it minimizes, says the same solutions cost between 144 and 927 bits. Both numbers are honest. The first is the cost of every parameter in the coordinates Adam searches. The second is the cost of the latent under the model's prior, with the decoder given for free. The gap between them is a factor of two to ten thousand.

One more thing from that sweep. For one of the seven solved puzzles, the final trained weights do not produce the answer at all. The vote over 2,000 steps chose it, and the weights had drifted away by the end. The trajectory solved the puzzle. The endpoint did not.

## Part three. Taking the gradient away

Now the main event. Two puzzles that Adam settles in about 200 steps. Four ways of optimizing the same loss, one hour each, seed zero, one CPU core each.

Adam on everything is the reference, from an earlier run. Adam on the latent only, with the decoder frozen at its random start, is the control. If that fails, a gradient-free failure on the latent tells us nothing. Then evolution strategies on the latent only, and evolution strategies on everything.

Evolution strategies here means the standard version from Salimans and colleagues. Perturb all the parameters with random noise 16 ways, in 8 mirrored pairs. Run the forward pass for each. Rank the results. Move the parameters toward the perturbations that did well. The direction estimate is smoothed with Adam's update rule, which is the usual practice, but there is no backward pass anywhere. One generation costs 17 forward passes and takes about 2.5 seconds against 0.35 seconds for an Adam step. That is 7 times slower per step, inside the 12 times allowance I set before running.

| Puzzle   | Optimizer         | Steps in an hour | Final loss | Times Adam's final loss | Equal to Adam at step | Produced the true grid |
| -------- | ----------------- | ---------------- | ---------- | ----------------------- | --------------------- | ---------------------- |
| 0962bcdd | Adam, everything  | 2,000            | 169        | 1.0                     |                       | 3,172 times            |
| 0962bcdd | Adam, latent only | 2,000            | 9,737      | 50                      | 77                    | never                  |
| 0962bcdd | ES, latent only   | 1,414            | 12,867     | 66                      | 71                    | never                  |
| 0962bcdd | ES, everything    | 1,387            | 4,786      | 25                      | 92                    | never                  |
| 025d127b | Adam, everything  | 2,000            | 139        | 1.0                     |                       | 2,799 times            |
| 025d127b | Adam, latent only | 2,000            | 72,469     | 396                     | 50                    | never                  |
| 025d127b | ES, latent only   | 1,608            | 74,621     | 408                     | 50                    | never                  |
| 025d127b | ES, everything    | 1,569            | 3,995      | 22                      | 99                    | never                  |

Three things to read off that table.

First, the control failed on its own. Adam with gradients, on the latent alone, ends 50 to 400 times worse than Adam on everything and never produces the answer. A decoder frozen at random initialization cannot express these solutions no matter what the latent does. That closes the idea of searching a small latent and keeping the decoder fixed, which was the cheap version of the thesis test. The latent-only evolution rows say nothing about evolution. They match the control on a problem with no solution.

Second, evolution strategies over everything got somewhere and then crawled. After 1,400 to 1,600 generations it sits at the loss Adam had after about 95 steps. It is still improving. On 025d127b it went from 4,527 at generation 600 to 3,995 at the end. At that rate it would need on the order of a hundred hours to reach where Adam is at step 200, and there is no reason to believe the rate holds.

Third, none of the gradient-free runs and neither of the frozen-decoder runs emitted the true grid even once. Adam emits it thousands of times on a puzzle it solves. The voting rule never had anything to vote for.

I tried four adjustments to the evolution strategy on one puzzle for 25 minutes each. Bigger noise, smaller noise, a population of 64 instead of 16, and a plain step instead of the Adam-smoothed one. None changed the picture. The numbers are in the journal.

I predicted this outcome in writing before the runs started. The theory says a gradient-free method pays a penalty proportional to the number of parameters, and there were 250 to 330 thousand live parameters. A recent method for training networks that have no gradients at all reports being at chance when trained from scratch at 4 million parameters, and its authors say plainly that where a gradient exists, Adam is faster and more accurate. Another recent paper fine tunes billion parameter models with plain evolution strategies, but from a trained starting point, which is a different problem from ours.

## What it changes about the plan

Read parts two and three together and the lesson is not "search cannot do this." It is that evolution strategies were searching a million-bit object for a few-hundred-bit answer. The model's own accounting says the information in a solution is small. The coordinates Adam works in make it huge. A gradient-free search over those coordinates failed exactly the way the dimension bound says it should.

So the next experiments change the coordinates, not the optimizer.

The first is to measure the intrinsic dimension of a solution. Li and colleagues did this for ordinary networks in 2018. Train inside a random subspace of the parameters and find the smallest subspace that still solves the task. For a small image classifier they found about 750 dimensions out of 200 thousand parameters. Nobody has measured it for a per-puzzle network like this one. If the answer is in the hundreds, evolution strategies over that many dimensions is a one hour experiment we already have the code for. If it is a hundred thousand, the solution really is that big in every linear coordinate system and the thesis needs a different representation entirely.

The second is cheap. Redo the rounding with a separate scale per channel and fifty steps of retraining at 2 bits, to separate "a solution needs 3 bits per number" from "my crude rounding threw it away."

The third is about that one puzzle whose final weights did not contain its answer. Save the weights every hundred steps and find the window where they do. If the trajectory is the solution rather than the endpoint, then the right object to compress or search for is a checkpoint, not a converged model.

The honest summary of the night is three closures and one number. Selection is not a lever. The latent-only shortcut is not a lever. The gradient is load bearing in the coordinates the method uses. And a solution the model says costs a few hundred bits costs a few million to write down. That last gap is where the project goes next.

## Sources

- [ARC-AGI Without Pretraining](https://iliao2345.github.io/blog_posts/arc_agi_without_pretraining/arc_agi_without_pretraining.html), Isaac Liao and Albert Gu, 2025. The method, its 20 percent evaluation figure, and the bundled prediction logs used in part one.
- [Evolution Strategies as a Scalable Alternative to Reinforcement Learning](https://arxiv.org/abs/1703.03864), Salimans, Ho, Chen, Sidor and Sutskever, 2017. The algorithm used in part three.
- [Measuring the Intrinsic Dimension of Objective Landscapes](https://arxiv.org/abs/1804.08838), Li, Farkhoor, Liu and Yosinski, 2018. The 750 dimension figure and the next experiment.
- [Training Non-Differentiable Networks via Optimal Transport](https://arxiv.org/abs/2605.01928), 2026. The at-chance-at-4-million-parameters result and the statement that Adam wins where gradients exist.
- [Evolution Strategies at Scale: LLM Fine-Tuning Beyond Reinforcement Learning](https://arxiv.org/abs/2509.24372), 2025. Full parameter evolution strategies at billion parameter scale, from a trained starting point.
- [Random Gradient-Free Minimization of Convex Functions](https://link.springer.com/article/10.1007/s10208-015-9296-2), Nesterov and Spokoiny, 2017. The dimension penalty for gradient-free methods.
- Our runs 1111 through 1115 in this project's results database, and journal entries 52 through 54.
