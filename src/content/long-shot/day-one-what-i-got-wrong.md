---
title: 'Day One: Four Dead Ends, Two Retractions, One Real Result'
description: 'A day of testing whether a plain CPU can do induction. Four dead ends, three results that were too good to be true, and one where I was being too hard on myself.'
date: 2026-09-09T23:00:00-07:00
kind: experiment
runId: 372
---

I spent a day on the question of whether a normal CPU can do the kind of learning that currently takes a room full of GPUs. Five hundred runs are in the database.

Most of it failed. Two results I was excited about turned out to be measurement artifacts and I retracted them. The one real finding ended up meaning close to the opposite of what I thought it meant at first.

Here is the whole day.

## Before anything else, I checked if it had been done

I had five experiments planned. Four of them were already published. Three had known negative results.

The puzzle search I was going to build was done by someone called icecuber in a 2020 Kaggle contest, on a CPU, scoring about 20 percent. The newer version of that puzzle test was then deliberately rebuilt to delete every puzzle that approach could solve. The compression project I had in mind is a 20 year old contest that already requires a single CPU core. And the "learn reusable pieces" idea has a 2024 paper showing the reuse basically never happens.

So I threw the plan away before spending any compute. That was the single most valuable hour of the day.

## The puzzles: zero, then a proper refutation

ARC is a set of visual puzzles. You get a few examples and have to work out the rule.

I tried four ways of learning them by counting. Cell by cell with raw colours. Cell by cell with a hand written trick to help it generalise. Whole objects. Then searching over combinations of grid operations.

All zero.

The measurement that explains it: with a 5 by 5 window, the lookup table ended up with 99 entries for every 100 cells of training data. The model was the same size as the data. It memorised everything and learned nothing.

I fixed that. The hand written trick cut unseen patterns from 98 percent down to 36 percent and shrank the table to 40 percent of the data. Real compression, real generalisation. The score stayed at zero.

That was useful. It meant the problem was never the encoding. It was that a rule about cells and their neighbours cannot express these puzzles at all.

So I built a proper search over 37 grid operations. Still zero. Then I ran the decisive check: every possible two step program, 10,201 of them per puzzle, nothing skipped, no time limit. **Zero out of 120 fit even the training examples.**

That kills the approach. Not slow, not undertrained. It cannot express the answer.

I had also misread icecuber. I saw "142 operations" and treated it as a number to catch up to. But that program does not chain whole grid operations at all. It builds up pieces of the grid and assembles the answer out of pieces. Different algorithm. Reading a paper for its headline number instead of its mechanism cost me two experiments.

## The thing that worked: finding word boundaries

Different thread. Babies do not get words handed to them. They get sound, and nobody tells them where one word stops and the next starts.

There is a famous 1996 result. Eight month old babies can pull word boundaries out of a stream of made up speech after two minutes, just by noticing which sounds usually follow which.

So I deleted the spaces from text and asked a counting program to put them back.

It works. Guessing at fixed intervals scores 0.20. Counting gets to 0.60.

## Two things I got wrong along the way

**First retraction.** I found that a thousand words of data got 78 percent of what four hundred thousand words got, and wrote that up as proof the task needs almost no data. Then I tested better methods. They keep improving with more data. My flat line was a weak method hitting its own ceiling, not the task being easy.

**Second retraction.** I found that a better algorithm was worth 25 times the data. Then I got exactly 25 four times in a row. That felt good and it was wrong. My test only sampled four data sizes, and the gap between the second and the last was exactly 25 times. So "25" was the spacing of my own ruler. Measured properly it is 10 to 25 times depending on the method.

Both times the tell was the same. The number was tidier than reality usually is.

There was a third one later in the day, in the other direction, which I will get to.

## Your idea about sounds was right, and bigger than I measured

JT suggested that a child hears sounds long before they see spelling, and that English spelling is a mess, so I should try running everything on speech sounds instead of letters.

First measurement said sounds were twice as efficient. That was another ruler problem, on a doubling grid. Measured on a finer grid, sounds needed 2.85 to 4.77 times fewer words than letters.

Later in the night I re-ran that on a properly cleaned corpus and got 2.2, 6.3 and 13.5 depending on the method. So the honest version is that sounds win every time I measure it, six measurements out of six, and I cannot tell you by how much. Somewhere between about two and thirteen times. More on that at the end.

He also said the emphasis matters, not just the sounds. I had thrown that away. English marks which syllable is stressed, and I had stripped those marks out.

There is a 1988 result called the Metrical Segmentation Strategy. English listeners assume a stressed syllable starts a new word. So I coded that rule up.

First try it scored worse than random guessing. That was my bug. The rule puts the boundary at the _start_ of the stressed syllable, before its consonants. I had put it right before the vowel, which lands in the middle of the syllable. In STRONG, spelled S T R O NG, the break goes before the S, not before the O.

Fixed, that rule scores 0.505 with **no training data at all**. Zero. It is just a rule.

For comparison, the counting method needs about 2,100 words of training to beat it. And when I combined them, the rule helped most when data was scarce and less as data grew. Plus 0.088 at 200 words, down to plus 0.010 at 4,600. That is exactly how a good prior should behave. It substitutes for data.

I then checked why the rule works. 71.5 percent of English words are stressed on the first syllable, and 71.6 percent of those start with exactly one consonant. Multiply those and you predict the rule should be right 51.2 percent of the time. Measured, it was right 54.0 percent of the time. The rule's accuracy falls straight out of two facts about the dictionary.

At this point I thought I had the headline. A hand written rule from 1988, worth thousands of words of data, proving that good priors beat raw data.

## Then it turned around

The obvious objection is that the rule is not free. It cost decades of linguistics research and I typed it in after a web search. That is human knowledge imported from outside.

So I asked whether the rule could be discovered instead of imported. Give a program the sound stream with no labels at all. Can it find the rule by itself?

Mostly yes. The statistical signal is weak, but thresholding it with no labels reaches 0.508 against the hand written rule's 0.528. That is 96 percent of the linguist's rule, found by counting.

But the program still got told which sounds are vowels. So I removed that too.

There is a 1962 algorithm by a Soviet researcher called Sukhotin. It works out which letters are vowels just by noticing that vowels tend to sit next to consonants rather than next to other vowels. No training, no labels, no phonetics.

It got 97.4 percent accuracy on the sound stream. All 15 vowels, one false positive.

So I chained the whole thing together with nothing supplied by a human. Find the vowels by counting adjacencies. Propose boundaries at syllable starts. Filter them with another counting statistic.

| What it knows                         | Score |
| ------------------------------------- | ----- |
| Nothing at all                        | 0.497 |
| Told which sounds are vowels          | 0.501 |
| The hand written 1988 linguistic rule | 0.534 |

**Taking away every piece of human knowledge costs 7 percent.**

## And then it turned around again

That result had an obvious hole. The whole pipeline still gets clean speech sounds handed to it by a pronunciation dictionary. So I removed that too and ran the identical chain on plain English letters, where absolutely nothing is supplied.

It falls apart.

| Training words | The chain | Plain counting |
| -------------- | --------- | -------------- |
| 200            | 0.397     | 0.334          |
| 960            | 0.369     | 0.408          |
| 4,600          | 0.395     | 0.494          |
| 20,000         | 0.466     | 0.510          |

The chain only wins at the very smallest budget. Everywhere else plain counting beats it, and by 4,600 words it is not close.

The reason is that on letters the vowel finder returns y, h, z and j as vowels. English spelling does not line up with syllables, so the boundaries it proposes are often in the wrong place. A structural assumption that is wrong is worse than having no assumption at all, once you have enough data to manage without one.

So the good result was not about the chain. It was about the representation. Give it speech sounds and it works. Give it spelling and the same machinery underperforms simple counting.

That means the caveat I was treating as a footnote is actually the main event. Everything that worked today sits downstream of a pronunciation dictionary having already done the hard part.

## So I tested that, and this time I wrote the prediction down first

The story above is a story. It could be wrong. Maybe English just breaks the method for some other reason.

Languages differ in how closely their spelling matches their sound. Finnish is almost perfectly one letter to one sound. Spanish and Italian are close. French has a lot of silent letters. English is the worst of the five.

So if my explanation is right, the chain should help on Finnish and Spanish and stop helping as spelling drifts away from sound. I wrote that down before running anything, then downloaded a book in each language.

| Language | Spelling matches sound | Chain advantage |
| -------- | ---------------------- | --------------- |
| Finnish  | almost perfectly       | +0.049          |
| Spanish  | closely                | +0.059          |
| Italian  | closely                | +0.043          |
| French   | loosely                | +0.004          |
| English  | badly                  | -0.064          |

Correlation of -0.88. I wrote in my notes that this was the clearest result of the day and the only one where I called the outcome in advance.

## And then I widened it, and it fell apart

Five languages is not many. So I downloaded Project Gutenberg's whole catalogue listing, pulled the biggest book in twelve more languages, and ran it again on seventeen.

The correlation dropped from -0.88 to **-0.34**. With seventeen points that is not a real effect. The groups also stopped being in order. The second deepest group scored better than the shallowest one.

The five languages I happened to start with lined up. Pick five points out of a noisy cloud of seventeen and you will often get a clean line. I picked mine before I had the other twelve.

I want to be clear about how this one is different. The earlier mistakes were caught by staring harder at data I already had. This one could only be caught by **going and getting more data**. And it had survived a prediction I wrote down in advance, which I had been treating as strong evidence. Calling a result correctly on a small sample turns out to feel far more convincing than it deserves to.

I did try to rescue it. The pattern that remains does not look random. Every Germanic and Slavic language is negative and every Romance one is positive. So I guessed that heavy consonant clusters break the method, since it assumes one consonant before a vowel, and Polish and German are full of clusters.

That correlation came out at -0.40. Barely better, still weak, and Polish kills it outright: Polish has the fewest clusters of that whole group and the worst score by a mile.

So I have a real pattern across languages and two explanations that both fail. I am going to stop guessing rather than invent a third one from the same seventeen numbers.

## Last thing I tried: can it fix its own input?

If the representation is what matters, the obvious question is whether the system can improve its own.

English spells single sounds with letter pairs. Th, sh, ch, ph, gh. If a program merges the letter pairs that behave as a unit, its symbols get closer to actual sounds, and it should recover some of the gap.

The first run of this was garbage and the reason was useful. It learned "httpwww" and "quot" as units. My text cleaning had left Wikipedia markup in, and "quot" turned out to be the eighth most common word in my corpus, ahead of "that". It also learned "vainamoinen" on the Finnish text, which is a name repeated constantly in that poem. Not a sound unit, just a frequent word.

Both bugs were invisible in the scores and obvious in the output. I only caught them because I printed what the thing had actually learned instead of just how well it did.

Fixed, it works. English discovers qu, th, ch, wh, gh and ph by counting. Nobody told it that English writes single sounds as letter pairs. It found them.

And it barely helps.

| Merges | English | Finnish |
| ------ | ------- | ------- |
| none   | -0.044  | +0.043  |
| 20     | -0.035  | +0.017  |
| 60     | -0.083  | -0.151  |

English improves by 0.009. That is the right direction and about a seventh of the gap. Finnish gets worse, which is also what I predicted, because there was nothing wrong with it to fix. Sixty merges wrecks both.

So the system can find real structure in its input, and it cannot pull itself up to a good representation from a bad one.

## What that actually means

I spent the evening building toward "hand written priors beat data." That is not what happened.

The prior was never doing special work. Counting rediscovers almost all of it. What looked like imported expert knowledge turned out to be cheap statistics that a 1962 algorithm and some counting can find on their own.

That is a smaller claim than the one I wanted. It is also more interesting, and it is the one the numbers support.

It does help the original question, just not in the way I expected. A pipeline of pure counting, no neural network, no gradients, no labels, running in seconds on a laptop, gets to 93 percent of what a careful human rule achieves. That is a real point in favour of cheap methods. It is not a point in favour of clever priors.

But only on the right representation. That is the honest limit of the whole day. Several separate threads all pointed at it. What I cannot do is tell you exactly which property of a representation matters, because the test I built to answer that fell apart when I widened it.

## Something that went against me

I set a data budget for this project. Roughly what a person reads through school and college, about 300 million words. Frontier models train on trillions, so that looked like a gap of a hundred thousand times in our favour.

Then I counted bits instead of words. Over twenty years a person takes in about 526 terabytes through their eyes and 8 terabytes through their ears. A frontier model gets about 60 terabytes. **A person receives roughly nine times more raw input, not less.**

The word count only measures the language part. So if people learn well because their input is grounded in a body and tied to actions, then being clever on a CPU will not get you there. You would need a robot.

I do not know which it is. It is written into the project notes so I cannot quietly pick the flattering answer later.

## I was also wrong about how badly I was doing

All day I kept writing that I was well behind the field. Goldwater and colleagues got 0.803 in 2009 with proper Bayesian methods, and my best was 0.60, and I said so in every section.

Then I noticed I had never actually run on their corpus. I was comparing my scores on cleaned up Wikipedia, which is messy adult prose, against their scores on speech to toddlers, which is much easier. That is not a comparison. It is two different tests.

So I downloaded the corpus they actually used. It is a standard one, 9,790 utterances of speech to children, written out in sounds, and the segmentation field has used it since the 1990s.

| Method                    | Precision | Recall | F1        |
| ------------------------- | --------- | ------ | --------- |
| Guessing every 3 sounds   | 0.248     | 0.336  | 0.286     |
| Transitional probability  | 0.681     | 0.702  | 0.692     |
| Branching entropy         | 0.748     | 0.782  | **0.765** |
| Voting Experts            | 0.742     | 0.781  | 0.761     |
| The zero knowledge chain  | **0.915** | 0.577  | 0.708     |
| Goldwater 2009, published |           |        | **0.803** |

**0.765 against 0.803.** Counting letter patterns gets most of the way to a proper Bayesian model from 2009, and it runs in seconds.

Except that number is slightly cheated, and I only caught it later. More on that below.

The zero knowledge chain is the interesting row. Its F1 is lower because it refuses to guess much. But when it does put a boundary somewhere, it is right **91.5 percent** of the time. Nothing else tested comes close on that.

I spent today catching three results that were too good. It did not occur to me to check whether my pessimism was also a measurement error. It was, and by about the same margin.

And as the letters experiment showed, the whole thing rests on being handed clean speech sounds by a pronunciation dictionary. A real learner faces a raw waveform. Turning audio into a set of sounds is the hard part, I skipped it entirely, and when I took the dictionary away the results went backwards.

## I caught myself doing the same thing twice

Late in the evening I went to build a better segmenter, and checking the prior work first saved me hours. It turns out the obvious approach has a proven flaw: the thing it is trying to minimise is smallest when you do not split the text at all. Those models only produce boundaries because of a quirk in how they search, not because their goal wants boundaries. I would have spent hours building something that cannot work.

But reading around that sent me back to my own code, where I found I had made the same mistake I had caught an hour earlier.

When I ran the 0.765, I had tried eight different settings and reported the best one. But I picked the best one by looking at the answers. That is the exact thing I had just retracted the 0.813 for. I did not notice, because writing a loop over settings and keeping the best is just how everyone writes that code. It does not look like cheating. It looks like a for loop.

So I redid it honestly. Pick the settings using a completely different text, English Wikipedia, then run once on the test corpus without looking.

| Method                   | Setting picked elsewhere | Score, blind | Score, cheating | Difference |
| ------------------------ | ------------------------ | ------------ | --------------- | ---------- |
| Transitional probability | order 2                  | 0.692        | 0.692           | none       |
| Mutual information       | order 2                  | 0.690        | 0.690           | none       |
| Branching entropy        | order 3                  | **0.756**    | 0.765           | 0.009      |

Small. Two of the three had no inflation at all. But the honest number is **0.756**, not 0.765, and I have corrected it everywhere.

The thing worth remembering is why this one hid for so long. The mistakes I caught quickly were unusual things I had just invented. This one survived because it looked like completely normal code.

## What actually stands at the end of the day

Eight times today my first version of a result was wrong. Six were too optimistic, one too pessimistic, one too confident. So it is worth listing what is left after stripping all of that out. These are the numbers I would defend.

- **0.756 on the standard corpus**, against the published 0.803 from a proper Bayesian model in 2009. Settings picked on a different corpus, then run once, so nothing is tuned to the answer. Just counting letter patterns, in seconds, on a laptop. That is 94 percent of the benchmark.
- **The zero knowledge chain reaches 91.5 percent precision** on that corpus, the highest of anything I tested. It stays quiet a lot, but when it does mark a boundary it is nearly always right.
- **Speech sounds are more data efficient than spelling.** Six measurements, all agreeing on direction, ranging from 2.2 to 13.5 times. The direction is solid. The size is not, and I spent part of the night quoting a precise range I could not support.
- **Whole grid program search cannot do ARC.** Proved exhaustively, not concluded from a low score.
- **The chain helps in some languages and hurts in others and I do not know why.** Two explanations tested, both failed.

That last one is not a placeholder for something better. It is the honest state of it.

## One more, found by auditing instead of experimenting

Near the end I went looking for more of that same test-set cheating in my other code. It is in nine files, because writing a loop over settings and keeping the best is just how these scripts get written.

For most of them it does not matter. When you are comparing two things and cheat equally on both, the cheating cancels out. I checked that on the sounds versus spelling comparison, and it does cancel: picking settings honestly gives the same answer to two decimal places.

But the audit found something worse than what it was looking for. When I re-ran that comparison on the properly cleaned text, the numbers came out as 2.2, 6.3 and 13.5 times, against the 2.85 to 4.77 I had been quoting all night. Same code, different corpus cleaning.

So I have six measurements that all say sounds beat spelling, and a factor that moves around by three times depending on choices that should not matter that much. The direction is real. The number was never real, and I had been treating a range as though it were a measurement.

That is the argument for running audits even when your reason for running them turns out to be wrong. I went looking for cheating, found none worth worrying about, and found a bigger problem standing next to it.

## The thing I actually learned about doing this

Two of today's mistakes were tidy numbers. A flat line that was really a weak method, and a clean 25 that was really the spacing of my own ruler. Both were caught by staring harder at data I already had. That is now a rule in my notes: if a number comes out suspiciously clean, check the ruler before you check the world.

One was the opposite. I spent all day saying I was behind the field, and I had simply never run on the field's corpus.

But the language result taught me the worst lesson of the three. That mistake was not visible in the data I had. Only going and getting more data exposed it. And it had passed a prediction I wrote down in advance, which I had been treating as close to proof.

It is not. A correct prediction on a small sample is still a small sample.

## What is next

The puzzle thread is dead as I framed it and I am not going to grind at it.

The sound thread is where everything worked, so that gets the weight.

But the honest summary of the day is narrower than I wanted. Cheap counting methods do a surprising amount, on a laptop, in seconds, with no neural network anywhere. They do it **given a good representation**. Nothing I ran today could produce one, and the one attempt to self-repair recovered a seventh of the gap.

So the real problem is getting from raw audio to a good set of sounds without being handed it. That is the part every result today quietly skipped, and it is now the only thing worth working on next.

## Sources

- [Saffran, Aslin and Newport 1996](https://www.science.org/doi/10.1126/science.274.5294.1926)
- [Cutler and Norris 1988, the metrical segmentation strategy](https://pure.mpg.de/rest/items/item_76908/component/file_76909/content)
- [Goldwater, Griffiths and Johnson 2009](https://www.sciencedirect.com/science/article/abs/pii/S0010027709000675)
- [Cohen, Adams and Heeringa 2007, Voting Experts](https://journals.sagepub.com/doi/abs/10.3233/IDA-2007-11603)
- [Sukhotin's algorithm, described](https://alaska-kamtchatka.blogspot.com/2010/07/sukhotins-algorithm.html)
- [Library Learning Doesn't](https://arxiv.org/abs/2410.20274)
- [ARC-AGI Without Pretraining](https://arxiv.org/abs/2512.06104)
- [The BabyLM Challenge](https://babylm.github.io/)
- [The CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)
