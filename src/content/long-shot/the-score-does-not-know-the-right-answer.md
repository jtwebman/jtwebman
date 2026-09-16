---
title: 'The score we were optimizing does not know the right answer'
description: 'A per puzzle CompressARC solution fits in ten thousand random directions and compresses to 18 kilobits. Then we measured whether its compression score tracks the answer at all, and on a random sample of puzzles it ranks them worse than a coin flip.'
date: 2026-09-16T02:30:00-07:00
kind: experiment
runId: 1125
---

**The short version.**

Four things tonight. The first two are about size and they are good news.

Pick ten thousand random directions in CompressARC's parameter space, throw away
every other direction, and train only inside what is left. All seven puzzles we
can test still solve. For the biggest puzzle that is ten thousand numbers out of
one and a half million, under one percent. Runs 1116, 1118, 1120. Each of those
numbers needs six bits, so a complete solution to one ARC puzzle is sixty
thousand bits, and for two puzzles it is eighteen thousand. Last night the same
measurement in the model's own coordinates gave one million bits. Runs 1117 and 1121.

The third is a failure that taught us something. If a solution lives in ten
thousand directions then gradient free search only has to look in ten thousand
directions instead of three hundred thousand. That is a thirty three times
smaller problem. It bought nothing at all. Runs 1119 and 1122.

The fourth explains the third, and it is the real result. **The score being
minimized does not reliably know which answer is right.** On one puzzle, full
gradient descent finishes with a score of 195 and the answer completely correct.
A run in a slightly smaller subspace finishes with a better score of 182 and the
answer fifteen percent wrong. Lower score, worse answer, same puzzle. Across
fifty runs, once the score is in the range where runs actually compete, it
barely ranks them at all. Run 1123 and run 1125.

Then a surprise, and then a partial deflation of it. A number that needs no
answer key beats the score at predicting success. Just count how many different
grids the trained model produces when you ask it a hundred times. Fewer is
better. On our own earlier runs it looked very strong. On a fresh random sample
of twenty four ordinary puzzles it came out real but much weaker, and it missed
the bar we had set for it in advance. Runs 1125 and 1127.

---

## What this is

CompressARC, by Isaac Liao and Albert Gu, is the strongest ARC method that is
not a large language model. For each puzzle it trains a small network from
scratch, at the moment you ask the question, using only that puzzle's own
examples. The training goal is compression. Find the shortest description of the
examples, then read the answer off it. They report twenty percent on the ARC
evaluation set.

This project is testing whether that kind of learning can be done by search
instead of by gradient descent, on one ordinary machine. CompressARC has the
compression half. It still uses Adam, which is gradient descent, for the other
half. Last night we took the gradient away and the method stopped working.
Tonight was meant to find out why.

## The solution fits in ten thousand directions

The method is from a 2018 paper by Chunyuan Li and colleagues. Instead of
letting the model move all of its parameters, you pick a fixed number of random
directions before training starts and only let it move along those. If it still
solves the task with a thousand directions, the task only needed a thousand
numbers. They found that recognizing handwritten digits needs about 750
directions out of two hundred thousand parameters. Nobody had run this on a
model that is trained fresh for each question.

All seven puzzles we can test solve at ten thousand directions. Two of them
solve at three thousand.

| Puzzle   | Parameters that matter | Smallest number of directions that works | As a fraction |
| -------- | ---------------------- | ---------------------------------------- | ------------- |
| 06df4c85 | 1,546,268              | 10,000                                   | 0.65%         |
| 025d127b | 254,668                | 3,000                                    | 1.2%          |
| 08ed6ac7 | 206,140                | 3,000                                    | 1.5%          |
| 2204b7a8 | 390,380                | 10,000                                   | 2.6%          |
| 1f876c06 | 355,460                | 10,000                                   | 2.8%          |
| 0962bcdd | 332,140                | 10,000                                   | 3.0%          |
| 05269061 | 187,124                | 7,000                                    | 3.7%          |

The parameter counts differ by more than eight times. The number of directions
needed does not follow. One honest caveat from the original paper. Random
directions are a crude way to find a small subspace, so the true number is
probably lower. Ten thousand is a ceiling, not a floor.

Each of those numbers survives being rounded to six bits and breaks at four.
That gives eighteen to sixty thousand bits for a whole solution. Six bits came
out the same on nine separate measurements, across four puzzles, two subspace
sizes, two random draws and three learning rates.

## Removing ninety seven percent of the problem bought nothing

Search methods that do not use gradients get worse as the number of things being
searched over goes up, roughly in proportion. So a thirty three times smaller
space should be a much easier job.

Ten runs, one hour each, three step sizes, two learning rates. Measured at an
equal number of forward passes, the small space version performed between 0.79
and 1.16 times as well as the full space version. And in every one of the ten
runs, the correct grid was never produced even once. Meanwhile Adam, in the same
ten thousand directions, using the same fixed random directions, on a quarter of
the computation, solves.

So the size of the space was not the obstacle. That sent us to look at the score
itself.

## The score and the answer come apart

We took every decoded guess at every training step and compared it cell by cell
against the true answer. That had never been measured here.

The headline is an inversion, not a weak relationship.

| Run on puzzle 0962bcdd | Final score | Cells correct |
| ---------------------- | ----------- | ------------- |
| Full gradient descent  | 195         | 100%          |
| 10,000 directions      | 183         | 98%           |
| 8,000 directions       | **182**     | **85%**       |

The run with the best score has the worst answer. Not a tie. The compression
score prefers a grid that is fifteen percent wrong.

The control makes it sharper. In the full runs the answer becomes exactly
correct at step 166 to 179, and then stays exactly correct for the remaining
eighteen hundred steps while the score keeps improving. **The score goes on
getting better long after the answer has stopped changing.** Whatever it is
measuring in that stretch, it is not how close the answer is.

We then asked the same question across fifty runs on seven puzzles. Over the
whole range the relationship is real but mostly trivial, because a run with a
terrible score has a terrible grid. Inside the range where runs actually compete,
the rank correlation between score and correctness is only -0.25. **In three of
the five puzzles that had both successes and failures, the run with the best
score is not the run that solves.** On one puzzle the worst run by score, three
and a half times worse than the best, had a better grid than the best.

There is a published result that predicts this shape. Alemi and colleagues, in a
2018 paper with the excellent title "Fixing a Broken ELBO", showed that for this
family of objectives there is a whole family of models with identical scores and
very different behaviour. CompressARC's loss is exactly that kind of objective.
We found the paper before running the experiment, which is the right order, and
it turned out to predict the phenomenon but not the mechanism. Their specific
mechanism is a tradeoff between two terms, and in our case both runs have the
same split between those terms.

This reframes the failure of gradient free search. We had been treating it as a
search problem. If the thing being optimized is only loosely related to being
right, then no search method optimizing it will reliably find the answer, however
good the search is.

## Counting different answers works better than the score

While measuring the above we recorded something else. Ask each trained model for
an answer a hundred times. It is random, so it gives different grids. Count how
many distinct ones.

On our fifty subspace runs it ranked success at 0.96, against 0.60 for the
compression score. Those are areas under the ROC curve, where 0.5 is a coin flip
and 1.0 is perfect, pooled within puzzles across 71 comparisons.

That number does not survive contact with ordinary runs, and this is the part
worth reading carefully. Fifty runs is not fifty independent measurements,
because they come from seven puzzles and share trajectories, and none of them is
a normal run. So we drew twenty four training puzzles at random, trained each one
the ordinary way, and counted. Nine solved, which matches the published rate.

| Predictor, twenty four random puzzles | Ranking measure |
| ------------------------------------- | --------------- |
| Fewer distinct answers                | 0.748           |
| Lower compression score               | 0.437           |

**We had set the bar at 0.75 before running. The result is 0.748. That is a
miss.** It is a real signal, with a p value of 0.023 against shuffled labels, and
it is far better than the 0.507 this project got from every score based signal it
tried on all 400 puzzles earlier. But it is not the 0.96 the subspace runs
suggested, and rounding it up would be exactly the behaviour these rules exist to
prevent.

The useful part is at one end. Of the six runs that gave thirteen or fewer
distinct answers, five solved, against a base rate of thirty seven percent. Of
the twelve that gave a hundred or more, two solved. So a small count is good
evidence the answer is right, and a large count is weak evidence it is wrong.
That is still worth something, because deciding to trust an answer and deciding
to reject one are different decisions.

And note the other row. **The compression score ranks those twenty four runs at
0.437, which is worse than a coin flip.** Not merely uninformative. Slightly
backwards. That is the third independent way we have now measured the same
thing.

## Puzzles do not share a decoder

One more, briefly, because it closes a direction the CompressARC authors
themselves suggested.

CompressARC's decoder is exactly 76,068 parameters for every puzzle, whatever
the puzzle looks like. That is not stated anywhere and it means decoders from
different puzzles can be compared directly. If different puzzles learned related
decoders, a new puzzle could start from what the others agreed on, and the search
problem would collapse to a handful of numbers.

Measured across seven puzzles, the trained decoders are at right angles to each
other, which is what seven random directions would give. That first measurement
had a flaw, because each puzzle starts from its own random starting point, and
the literature on comparing weights is clear that you need a shared starting
point. So we gave five puzzles the same starting decoder and trained them again.
The alignment went from nothing to about twelve times chance level, so there is a
shared component and it is real.

It is also too small to use. Arithmetic on the sizes says the shared part is at
most about five percent of the distance the decoder has to travel. We tested it
anyway by starting each puzzle from what the other four agreed on. That was
worse than starting from a random direction of the same length, and one puzzle
stopped solving.

## The mistake that made the night

Halfway through, the gradient free runs came out seven times worse in the small
space than in the big one at the same point. That is backwards, so we checked the
setup instead of blaming the idea.

Adam moves each number it controls by roughly a fixed amount per step. In the
full space it controls three hundred thousand numbers. In the small space it
controls ten thousand. So the same setting moves the model about six times less
far per step. Every early run had been taking steps six times too small.

Fixing it made one puzzle solve in a three times smaller subspace, which is
where the eighteen thousand bit figure comes from, and made another puzzle stop
solving. Two lessons. The number of directions a solution needs is not a property
of the solution alone, it depends on the step size, and two puzzles moved in
opposite directions under the same change. And the second lesson is one we had
already written down and broke anyway. A learning rate check was planned before
running and got skipped because the first sweep gave a positive result. A
positive result is not a reason to skip a check.

## What changes

Gradient free search over CompressARC's parameters is finished as a line of work
here. It has been bounded three ways, over three hundred thousand directions,
over ten thousand, and against gradient descent in the same ten thousand. Three
problems of very different sizes, one ceiling.

But the more useful conclusion is that we were pointing at the wrong thing. The
project's bet is that compression can replace gradient descent. Tonight says that
on this method, the compression score stops tracking the answer early in training
and then keeps improving anyway. A better searcher on that score would still
often return the wrong grid.

We did look at the stall. On the puzzle where the smaller subspace gets stuck,
we recorded which cells were wrong at every step over the last thousand steps.
**Exactly twenty four of the one hundred forty four cells are wrong at every
single step, with no variation at all, and they account for one hundred percent
of the errors.** The run has not got lost near the answer. It has settled on one
fixed wrong grid and stayed there. In the larger subspace, no cell is
permanently wrong. Every cell is right some of the time, which is the condition a
vote needs in order to assemble a correct answer. So what the extra two thousand
directions buy is concrete. They buy the ability to be right about twenty four
particular cells, and the score prefers the version that cannot reach them.

One more thing fell out of the random sample and it is uncomfortable. Take a run
that solved, then ask the finished model for its answer a hundred more times. For
five of the nine solved runs, the finished model does not produce the answer its
own training run picked. The answer appeared partway through and the model moved
on. So about half the time, the thing you would save, compress or search for is
not the thing that solved the puzzle.

So the next questions are about the score and about what object to keep, not
about the searcher.

## Sources

- [ARC-AGI Without Pretraining, Liao and Gu](https://arxiv.org/abs/2512.06104) and the [code](https://github.com/iliao2345/CompressARC)
- [Measuring the Intrinsic Dimension of Objective Landscapes, Li and colleagues, 2018](https://openreview.net/pdf?id=ryup8-WCW)
- [Fixing a Broken ELBO, Alemi and colleagues, 2018](https://arxiv.org/abs/1711.00464)
- [Git Re-Basin: Merging Models Modulo Permutation Symmetries](https://arxiv.org/abs/2209.04836)
- [Training Neural Networks in Low-Dimensional Random Bases, Gressmann and colleagues](https://www.graphcore.ai/posts/training-neural-networks-in-low-dimensional-random-bases)
- [Evolution Strategies as a Scalable Alternative to Reinforcement Learning, Salimans and colleagues](https://arxiv.org/abs/1703.03864)
