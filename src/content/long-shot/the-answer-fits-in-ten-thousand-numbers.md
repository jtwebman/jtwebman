---
title: 'The answer fits in ten thousand numbers'
description: 'A per puzzle CompressARC solution lives in ten thousand random directions out of up to 1.5 million, on all seven puzzles we can test. It compresses to 18 kilobits. Removing ninety seven percent of the search space did not help the gradient free version at all.'
date: 2026-09-15T23:30:00-07:00
kind: experiment
runId: 1116
---

**The short version.**

Last night we found that CompressARC needs its gradient. Tonight we asked how big the thing it finds actually is. The answer is small. Pick ten thousand random directions in the model's parameter space, throw away every other direction, and train only inside what is left. All seven puzzles we can test still solve. For the biggest puzzle that is ten thousand numbers out of one and a half million, which is under one percent. Runs 1116, 1118, 1120.

Then we measured how precise those ten thousand numbers need to be. Six bits each. So a complete solution to one ARC puzzle is sixty thousand bits, and for two of the puzzles it is eighteen thousand. Last night the same measurement in the model's own coordinates gave one million bits. Run 1117 and run 1121.

Then we did the obvious thing and it failed. If the solution lives in ten thousand directions, gradient free search only has to look in ten thousand directions instead of three hundred thousand. That is a thirty three times smaller problem. It bought nothing. Evolution strategies inside the small space performed between 0.79 and 1.16 times as well as evolution strategies in the full space, and never once produced the correct grid in ten runs. Runs 1119 and 1122.

So the story I told last night was wrong, and the correction is the most useful thing here.

---

## What this is

CompressARC, by Isaac Liao and Albert Gu, is the strongest ARC method that is not a large language model. For each puzzle it trains a small network from scratch, at the moment you ask the question, using only that puzzle's own examples. The training objective is compression. Find the shortest description of the examples, then read the answer off it. They report twenty percent on the ARC evaluation set.

This project is testing whether that kind of learning can be done by search instead of by gradient descent, on one ordinary machine. CompressARC has the compression half. It still uses Adam, which is gradient descent, for the other half.

Last night we replaced Adam with evolution strategies, which is a search method that only needs forward passes. It got nowhere. In the write up I said the lesson was about coordinates. The search was being asked to find a few hundred bits of answer inside a million bit object, and that seemed like the problem. Tonight was supposed to fix the coordinates.

## Part one. The solution fits in ten thousand directions

The method is from a 2018 paper by Chunyuan Li and colleagues called Measuring the Intrinsic Dimension of Objective Landscapes. The idea is simple. Instead of letting the model move all of its parameters, you pick a fixed number of random directions before training starts, and you only let it move along those. If the model still solves the task with a thousand directions, then in some real sense the task only needed a thousand numbers. They found that recognizing handwritten digits needs about 750 directions out of two hundred thousand parameters.

Nobody had run this on a model that is trained fresh for each question. So we did.

We tried one hundred, three hundred, one thousand, three thousand and ten thousand directions, on two puzzles. At ten thousand both puzzles solved. At eight thousand neither did, and we checked that with three different random draws on each side, so the boundary is not luck.

Then we extended it to every training puzzle that CompressARC solves at this random seed, which is seven. All seven solve at ten thousand directions. Two of them solve at three thousand.

| Puzzle   | Parameters that matter | Smallest number of directions that works | As a fraction |
| -------- | ---------------------- | ---------------------------------------- | ------------- |
| 06df4c85 | 1,546,268              | 10,000                                   | 0.65%         |
| 025d127b | 254,668                | 3,000                                    | 1.2%          |
| 08ed6ac7 | 206,140                | 3,000                                    | 1.5%          |
| 2204b7a8 | 390,380                | 10,000                                   | 2.6%          |
| 1f876c06 | 355,460                | 10,000                                   | 2.8%          |
| 0962bcdd | 332,140                | 10,000                                   | 3.0%          |
| 05269061 | 187,124                | 10,000                                   | 5.3%          |

The parameter counts differ by more than eight times across those puzzles. The number of directions needed does not follow. It is ten thousand for all of them. That matches what the 2018 paper found for ordinary networks, where the number was stable across models of very different sizes, and as far as we can tell nobody has shown it for a model that is built per question.

One honest caveat, which comes from the original paper and not from us. Random directions are a crude way to look for a small subspace. The true number is probably lower than what this method reports. So ten thousand is a ceiling, not a floor.

## Part two. Six bits per number

If the solution is ten thousand numbers, the next question is how precise each number has to be. We rounded them to sixteen, eight, six, four, three, two and one bits, and re ran the scoring each time.

Six bits works. Four does not, and the failure is not gradual. At six bits the objective is within about twenty percent of where it was. At four it is five to sixty five times worse and the answer is gone.

We measured six bits nine separate times, across four puzzles, two subspace sizes, two random draws and three learning rates. It was six every single time.

So the totals are these.

| What was measured                               | Bits                   |
| ----------------------------------------------- | ---------------------- |
| Last night, in the model's own parameters       | 1,020,000 to 1,330,000 |
| Tonight, ten thousand directions at six bits    | 60,000                 |
| Tonight, three thousand directions at six bits  | 18,000                 |
| What the model's own accounting claims it found | 144 to 927             |

That last row needs explaining. CompressARC is a compression method, so it reports its own estimate of how many bits of information it extracted. For these puzzles that estimate is a few hundred bits. The gap between what it says it found and what it costs to write down was about seven thousand times last night. It is now between one hundred twenty five and four hundred times. That is real progress on a number nobody had published, and it is still a gap of two to three orders of magnitude.

The caveat here is the ordinary one for this kind of claim. The eighteen thousand bits buys the coordinates. Rebuilding the solution also needs the starting point and the set of random directions, and those come from two integers only if you already have the code and the same random number generator. That is the standard convention for this sort of measurement, and it is the same convention last night's one million bit figure was quoted under, so the comparison between them is fair.

## Part three. The obvious next step, which failed

Now the experiment the first two parts existed to make possible.

Search methods that do not use gradients get worse as the number of things being searched over goes up. That is not a guess, it is the standard theory, and the cost grows roughly in proportion to the count. So if a solution lives in ten thousand directions rather than three hundred thousand, search should have a thirty three times easier job.

We ran exactly last night's evolution strategy, on the same puzzles, with the same population size and the same objective, inside the ten thousand direction space. Ten runs, one hour each, three different step sizes, two learning rates.

Nothing. Measured at an equal number of forward passes, the small space version performed between 0.79 and 1.16 times as well as the full space version. Call it a twenty percent improvement at best, from removing ninety seven percent of the problem. And in all ten runs, across both puzzles, the correct grid was never produced even once, not as the top answer and not as any answer.

Meanwhile Adam, in the same ten thousand directions, using the same fixed set of random directions, on a quarter of the computation, reaches an objective value twenty four times better and solves the puzzle.

So last night's explanation was wrong. The problem is not the number of dimensions. We have now varied that by thirty three times and varied the step size by five times, separately, with everything else held fixed, and the end result moves by under a quarter in both cases. Something about the shape of this objective defeats gradient free search, and it is not the size of the space.

## The mistake that made the night

Halfway through, the gradient free runs came out seven times worse in the small space than in the big one at the same point. That is backwards, and it was too strange to blame on the idea, so I checked the setup.

Adam moves each number it controls by roughly a fixed amount per step. In the full space it controls three hundred thousand numbers. In the small space it controls ten thousand. So the same setting moves the model about five point eight times less far per step in the small space. Every run in part one had been taking steps almost six times too small.

Fixing that changed three things. One puzzle that had failed at three thousand directions started solving, which is why two of the seven now sit at three thousand and why the eighteen thousand bit figure exists at all. One puzzle that had solved at ten thousand stopped solving. And the gradient free runs got four and a half times better early on, then landed in exactly the same place by the end of the hour.

Two lessons. The first is that the number of directions a solution needs is not a property of the solution alone. It depends on the step size, and two puzzles moved in opposite directions under the same change. Any figure of this kind has to be quoted with its settings.

The second is a rule this project already wrote down and I broke anyway. I had planned a learning rate check before running, then skipped it because the first sweep produced a positive result. A positive result is not a reason to skip a check.

## The thing I keep finding and keep filing under curiosities

Four separate times tonight, and twice on previous nights, the objective and the answer came apart.

At eight thousand directions on one puzzle, the objective reached a better value than the ten thousand direction run that solved it. The eight thousand run never produced the correct grid at all. Same puzzle, same code, effectively the same score, opposite outcome.

Worse, we checked whether each finished run still contains its own answer. You train it, it solves, you then run the finished model fresh and ask it for the answer again. In four of nineteen runs across both coordinate systems, it does not have it. The answer was produced somewhere in the middle of training, the voting rule accumulated enough evidence to pick it, and by the end the model has moved away. One puzzle fails this check in both coordinate systems, which suggests it is a property of that puzzle.

About a quarter of the time, the trained model is not the thing that knows the answer. The trajectory is.

I have been treating that as an oddity for three sessions. It is not an oddity. It is the most reproducible fact we have about this method, and it is a fact about the compression objective, which is the half of CompressARC that this project actually cares about. It is now the top of the list.

## What changes

Gradient free search over CompressARC's parameters is finished as a line of work here. It has been bounded three ways. Over three hundred thousand directions it reaches what Adam reaches in ninety five steps. Over ten thousand directions it reaches the same place. Over the same ten thousand directions, Adam solves. Three problems of very different sizes, one ceiling. A fourth variant would not tell us anything.

Two things are worth doing instead.

The first is finding out why the objective and the answer come apart. That is a question about the compression objective itself, and it is cheap to attack, because we now have pairs of runs that share a score and differ in outcome.

The second is that we have been searching the wrong kind of object. A solution is now known to be three to ten thousand whole numbers, each between zero and sixty three. That is a discrete thing. Evolution strategies search smooth continuous spaces, and that choice is now measured out. Discrete search is what this project was set up to test in the first place, and it has never been pointed at this.

## Sources

- [ARC-AGI Without Pretraining, Liao and Gu](https://arxiv.org/abs/2512.06104) and the [code](https://github.com/iliao2345/CompressARC)
- [Measuring the Intrinsic Dimension of Objective Landscapes, Li and colleagues, 2018](https://openreview.net/pdf?id=ryup8-WCW)
- [Intrinsic Dimensionality Explains the Effectiveness of Language Model Fine-Tuning, Aghajanyan and colleagues](https://arxiv.org/pdf/2012.13255)
- [Training Neural Networks in Low-Dimensional Random Bases, Gressmann and colleagues](https://www.graphcore.ai/posts/training-neural-networks-in-low-dimensional-random-bases)
- [Evolution Strategies as a Scalable Alternative to Reinforcement Learning, Salimans and colleagues](https://arxiv.org/abs/1703.03864)
- [Zeroth-order Random Subspace Algorithm for Non-smooth Convex Optimization](https://arxiv.org/abs/2401.13944)
