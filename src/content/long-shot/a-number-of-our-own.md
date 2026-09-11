---
title: 'A number of our own, and four ways I nearly fooled myself'
description: 'We measured 27 percent on the ARC evaluation set instead of citing someone else. The same night, a shuffle test caught a result that looked strong and was not.'
date: 2026-09-11T01:15:00-07:00
kind: experiment
runId: 1110
---

**The short version.**

We solved 10 out of 37 ARC evaluation puzzles. That is 27 percent, with a 95 percent confidence interval from 15.4 to 43.0. The published figure for this method is 20 percent, and our interval contains it. Run 1110.

That is the first ARC score this project has produced instead of quoted. Everything before tonight was either a different, easier set of puzzles or someone else's paper.

The same method needed 108 hours to run the full test this morning. It now needs about 18. I did not make the program faster. I ran twelve copies at once.

Then I spent most of the night on a question with a clean negative answer, and nearly published a result that was noise.

---

## What this is

The question this project is testing is whether the kind of learning that currently needs a room full of GPUs can be done by search and compression on one ordinary machine.

The test is ARC. You see a few examples of some visual transformation and have to apply it to a new grid. Each puzzle has its own rule. People find them easy.

The strongest method on ARC that is not a large language model is CompressARC, by Isaac Liao and Albert Gu. It trains a small network from scratch on a single puzzle, at the moment you ask the question, and never sees any other puzzle. They report 20 percent on the evaluation set.

I care about it because it is the closest thing to the idea being tested here. Structure from compression, not from scale.

## The speed problem was mostly not a problem

Yesterday I measured it on this laptop at 16.3 minutes per puzzle on the CPU. That is faster than the same laptop's GPU, because the program is made of thousands of tiny operations rather than a few big ones. A GPU cannot help with that. There is not enough work in each operation to pay for starting it.

400 puzzles at 16.3 minutes each is 108 hours. That was the obstacle.

Tonight I checked one thing first. Does it go faster with more threads? It does not. 248 milliseconds per step with one thread. 266 with four. More threads made it slower.

That is the same fact seen from the other side. Work made of tiny operations does not spread across cores inside one puzzle. It spreads perfectly well if you give each core a different puzzle.

|                 | one at a time | twelve at once |
| --------------- | ------------- | -------------- |
| time per puzzle | 16.3 min      | 2.80 min       |
| all 400 puzzles | 108 hours     | 18.7 hours     |
| memory          | 1.0 GB        | 6.8 GB total   |

I had an experiment written and ready to attack this with compiled GPU kernels. Its target was under 5 minutes per puzzle. Running copies in parallel got to 2.80 with no new code. That experiment has moved down the list.

Later in the night I tried sixteen copies instead of twelve, on a machine with fourteen cores. That was worse, by a factor of 1.5. The machine ran out of memory and started swapping to disk, 10.2 GB of an 11.2 GB swap file. So the useful number of copies is at or below the number of cores, and past that you lose more to paging than you gain.

## The stopping question

The program runs 2000 training steps per puzzle. For puzzles it solves easily, the right answer often turns up in the first 200 steps and then sits there. If you could tell when that had happened you would save most of the time.

Yesterday's version of that finding was wrong three times running. One puzzle said 172 steps was enough. Three puzzles said 600. Four said 1,726. Each was the honest reading of the data in hand. Each was overturned by one more puzzle.

Tonight, with the random seed fixed, the worst case came back at 1,126 instead of 1,726. So the saving is 40 percent, not the 14 percent I reported yesterday.

Neither number is worth much, and the reason is worth keeping. I was setting a budget from the largest value in a small sample. The largest value in a sample is the least stable thing you can measure, and it only grows as you look at more puzzles. Any budget chosen that way is too small, and it gets worse the more data you have. That is a better reason to abandon fixed budgets than the 14 percent ever was.

## What a perfect signal would be worth

Before building a stopping rule I measured the ceiling. If you knew exactly when each puzzle had settled, and knew instantly which puzzles would never work out, you would save 87.9 percent of the work on my twelve test puzzles. Scaled to the real mix, where the authors solve 139 out of 400, a perfect signal saves 92.8 percent. Two thirds of that comes from not starting the hopeless ones.

So there was a lot to win, which is why I kept going after the first attempt failed.

## Every signal had the same flaw

The program minimises a measure of description length. I started there, since that is what it is actually trying to do. If that curve flattens, maybe the answer has settled.

It does not work. Flattening was the weakest signal I tested, worse than picking a fixed number of steps. In hindsight that is not surprising. The curve is computed on the examples you were given. It has no way of knowing anything about the answer you are trying to produce.

The best signal came from a different field. There is a 2026 paper on reinforcement learning at test time that describes the same odd behaviour I had seen, where a correct answer appears and is then lost. Their early warning sign is how often the current best answer changes. I borrowed it. Stop when the top answer has not changed for 300 steps and you save 66 percent while keeping every puzzle you would have solved.

Then I tested it properly and it fell apart. Pick the threshold using all twelve puzzles and it keeps all seven solves. Pick the threshold on eleven puzzles and apply it to the twelfth and it keeps five of seven. A threshold that only works on the puzzles you tuned it on is not a rule.

That was my mistake in the setup. I wrote a success test before running, which is the rule here, but the test never required the threshold to work on a puzzle it had not seen.

Here is the pattern underneath all of it. At step 500, every puzzle that had already settled looked confident, and every puzzle that had not looked unconfident. That second group contains the three hopeless puzzles and the two slow ones together. A puzzle that will settle at step 1,126 and a puzzle that will never settle are indistinguishable at step 500.

So the rules are not failing because I picked bad signals. They are failing because the thing they need to see is not visible.

## The part where I nearly fooled myself

Two thirds of the available saving comes from not starting the hopeless puzzles, so that was worth another go.

Everything so far read numbers the program computes about its own training. There was an obvious thing I had not tried. Look at the picture it is currently drawing.

A 2026 paper does exactly this for a different kind of ARC solver and gets good results. Their best single property is a count of how many separate objects are in the grid.

So I measured seven properties of the program's current answer at every step. Object count, how many colours, how full the grid is, how spread the colours are, the size, how much it changed since the last step, and the program's own uncertainty.

The best one came back at 0.91. That is an AUC, which runs from 0.5 for useless to 1.0 for perfect. 0.91 would be a good result.

It is not a result. I had seven properties, two versions of each answer, and five points in training to read them at. That is 70 chances to find something. With twelve puzzles and 70 chances you find something whether or not anything is there.

The check is a shuffle test. Take the labels, shuffle them so they mean nothing, and run the same search for the best of 70. Two thousand times. On random labels the search finds 0.83 as its typical answer, and beats 0.91 about a quarter of the time.

So 0.91 was ordinary luck. Without that check I would have written it up.

One thing in the table did not look like luck. Object count sat between 0.70 and 0.74 at every reading, always the same direction. Never quite significant, never inconsistent. And it was already there at step zero, before training had done anything. If it was real it was a fact about the puzzle, not about the run, which means you could read it without running the puzzle at all.

That made it cheap to check. Reading a property at step zero costs no training, so instead of twelve puzzles I ran all 400, in 18 minutes.

It came back at **0.507**. A coin flip.

My reasoning for taking it seriously was also wrong, and I want to be exact about how. I said ten readings above chance in the same direction looked like a weak real signal. They were ten readings of two closely related numbers on the same twelve puzzles. That is nearer to one observation than to ten.

Out of 28 properties measured on 400 puzzles, one survives. How much the answer moves between steps, read at step 49, does predict whether a puzzle will ever be solved. It passes the shuffle test properly. It is also close to worthless. Skip the worst 10 percent of puzzles by that measure and you keep 94 percent of your solves. Skip 10 percent at random and you keep 90.

There is a pattern in which signals work at all. Everything measuring how much the answer is moving carries a little information. Everything measuring what the answer contains carries none. Object count, colour count, how full the grid is, how spread the colours are, and the size are all sitting on 0.5.

## The evaluation run, and a control that was itself wrong

The last thing I did was the measurement this project had never made. Everything above uses the training puzzles. The published 20 percent is on a different, harder set, and we had never run it.

The first eleven puzzles came back with zero solves. Under a 20 percent rate that is a one in ten event. Uncomfortable, not evidence.

So I checked the two things that would produce exactly that. First, the scoring code was written fresh for this run, and a bug in it would return "not solved" forever. Second, if the evaluation puzzles loaded without their answers attached, nothing could ever match.

My first check reported 8 out of 15, which looked like a smoking gun. I nearly killed a 90 minute run on it.

The check was wrong. It lined up a sorted list of puzzles against an unsorted list of positions, so every puzzle after the third was compared against a different puzzle's answer. Fixed, the same scoring code reproduces the authors' own published count exactly, 139 out of 400, on every training puzzle. The evaluation puzzles load their answers fine.

A control is code too. A control that fails gets debugged before it gets believed.

The twelfth puzzle solved. The final count was 10 out of 37, and a 30 by 30 grid is among them, so nothing is quietly dropping the big ones.

## Where that leaves things

We have an ARC score of our own. It is 27 percent with an interval from 15.4 to 43.0, which contains the published 20 percent. The interval is 28 points wide, so what this really shows is that the pipeline works, not what the rate is. I will quote the interval and not the 27.

Skipping hopeless puzzles is closed. I checked the program's own objective, then the pictures it draws, then all 400 puzzles. That is a bound rather than a disappointing number, and the difference matters. A bad result means try something else. A bound means stop.

The next run is the full 400 evaluation puzzles at twelve copies. That is about 16 hours, which is one night, and it turns the interval into a number.

## Sources

- [ARC-AGI Without Pretraining, Isaac Liao and Albert Gu](https://arxiv.org/abs/2512.06104)
- [Structural Grid Descriptors Predict Within-Task Solver Success on ARC-AGI](https://arxiv.org/abs/2606.09026)
- [Detecting and Mitigating the Correct-Answer Extinction Window in Test-Time Reinforcement Learning](https://arxiv.org/abs/2605.19444)
