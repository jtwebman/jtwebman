---
title: 'Day One: I Was Wrong Ten Times'
description: 'A day testing whether a plain CPU can do induction. Seven results too good to be true, two too pessimistic, one too confident, and what survived all of it.'
date: 2026-09-09T23:00:00-07:00
kind: experiment
runId: 786
---

**The short version, if you do not want all of it.**

Counting gets **0.881** on the standard word segmentation benchmark, against 0.803 from a well-known Bayesian model published in 2009. On the stricter whole-word measure it is 0.791 against their 0.624. I could not establish whether better published numbers exist on this corpus, and they probably do. No neural network, no gradients, seconds on a laptop, five-fold cross-validation with everything learned on held-out data.

Two honest caveats, both found by trying to break it. The part that gets from 0.758 to 0.847 works in all eight languages I tested. The part that gets from there to 0.881 only helps in five of the eight.

The catch arrives at the end: that same method is the most fragile thing I tested once the input has realistic errors in it.

A version of it that works out almost everything by counting, including which letters are vowels, is right 91.5 percent of the time when it marks a boundary. It needs exactly one bit of outside help, which I did not notice until late.

Searching over grid programs cannot solve ARC puzzles. I proved that exhaustively rather than guessing from a bad score.

Ten of my results today were wrong the first time. I caught all ten before publishing, and that process is most of what this post is about.

I found what looked like the weak component, spent four experiments fixing it, and then discovered it was not what was holding things back. Handing the program perfect knowledge of that step is worth 0.007.

The bigger thing everything pointed at: the bottleneck is not the algorithm, it is the representation. Cheap methods do remarkable work when handed good symbols, nothing I built could produce good symbols, and when I simulated the errors you get from trying, the results lost about a third of their edge.

---

I spent a day on the question of whether a normal CPU can do the kind of learning that currently takes a room full of GPUs. There are 786 runs in the database.

Plenty of it failed. Several results I was pleased with turned out to be measurement artifacts. The best finding of the day ended up meaning close to the opposite of what I first thought, and I only worked that out by trying to knock it down.

Here is the whole day, in the order it happened.

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

Except it turned out later that I had not taken away every piece. More on that near the end.

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

So I had a real pattern across languages and two explanations that both failed. I wrote in my notes that I should stop guessing, and specifically that I should not invent a third explanation out of the same seventeen numbers unless I could measure it **without looking at the segmentation scores at all**.

Late in the night I found one, by accident, while trying to fix something else.

The vowel finder returns complete nonsense on Polish. Zero out of the true vowels. And Polish was the worst language in that table by a mile. So I measured how good the vowel finder is in each language, which I can check against a simple list of that language's vowels and never touch the boundary scores.

| Explanation                         | How strongly it predicts |
| ----------------------------------- | ------------------------ |
| How well spelling matches sound     | -0.34                    |
| Consonant clusters                  | -0.40                    |
| **How well the vowel finder works** | **+0.66**                |

That is a real answer, and it is a deflating one. The chain does badly in a language when its very first step, working out which letters are vowels, goes wrong. Polish writes single sounds as letter pairs, sz and cz and rz. Dutch does the same with ij and oe. The vowel finder chokes on that, and everything built on top of it inherits the mess.

So the variation across languages is mostly **my own pipeline breaking**, not a deep fact about languages. Two languages still do not fit, Swedish and Danish, which have a good vowel finder and bad scores anyway. So it is not the whole story either.

## Can it fix its own input?

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

I had spent the day catching results that were too good. It did not occur to me to check whether my pessimism was also a measurement error. It was, and by about the same margin.

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

So I went looking for the same thing everywhere else. It is in nine files, because writing a loop over settings and keeping the best is just how these scripts get written. Mostly it does not matter: when you compare two things and cheat equally on both, the cheating cancels, and I checked that on the sounds versus spelling comparison.

But that audit found something worse than what it went looking for. Re-running the comparison on properly cleaned text gave 2.2, 6.3 and 13.5 times, against the 2.85 to 4.77 I had been quoting all evening. Same code, different corpus cleaning. So I have six measurements that all say sounds beat spelling and a factor that swings by three times on choices that should not matter. The direction is real. The number never was.

Two things worth keeping from this. Run the audit even when the reason for running it turns out to be wrong. And notice why this mistake hid for so long: the ones I caught quickly were unusual things I had just invented, while this one survived because it looked like completely normal code.

## Would any of this survive real audio?

Everything above assumes clean speech sounds handed over by a dictionary. The obvious next project is working them out from actual audio instead. That is weeks of work, so before starting it I ran the cheap version of the question.

Real programs that try to discover speech sounds from audio without supervision get them wrong 30 to 50 percent of the time. So I took my clean sound stream and deliberately corrupted it at those rates. Swapped sounds for other sounds, dropped some, inserted some. Then re-ran everything.

| Sound errors | Guessing | Best method | Vowels found |
| ------------ | -------- | ----------- | ------------ |
| none         | 0.251    | 0.617       | all          |
| 10 percent   | 0.245    | 0.517       | all          |
| 20 percent   | 0.238    | 0.422       | **none**     |
| 30 percent   | 0.242    | 0.365       | none         |
| 40 percent   | 0.246    | 0.350       | a quarter    |

At the error rates you would actually get, the best method scores 0.365 against a floor of 0.242. On clean input it was two and a half times better than guessing. Now it is one and a half times.

And the vowel finder dies completely at 20 percent errors. It works by noticing that vowels sit next to consonants, and swapping sounds around at random destroys exactly that pattern. Everything in my zero knowledge chain is built on that first step, so the whole chain has nothing to stand on.

I wrote that up as a flat no. Then, about an hour later, I found the flaw in my own test.

When I corrupted the stream, I replaced a sound with a **completely random** other sound. A vowel could become any consonant. That is not how real systems fail. Real systems confuse sounds that are acoustically similar, p with b, s with z, one vowel with a nearby vowel. Vowels almost always get confused with other vowels.

That distinction matters enormously here, because the vowel finder works by noticing that vowels sit next to consonants. Random swapping destroys that pattern. Realistic confusion leaves it almost intact.

So I redid it with a proper confusion model.

| Sound errors at 30 percent | Best method vs guessing | Vowels found    |
| -------------------------- | ----------------------- | --------------- |
| my random model            | 1.49 times              | a third         |
| realistic confusion        | 1.64 times              | **all of them** |
| acoustic class confusion   | 1.83 times              | all of them     |

Clean input scores 2.46 times guessing, for comparison.

**The vowel collapse was my mistake, not a finding.** With a realistic model the vowel finder keeps every single vowel, at every error rate I tried, including 40 percent.

The honest version is therefore much softer than what I first wrote. At realistic error rates these methods keep about two thirds of their advantage. That is damaged, not destroyed.

It still narrows what today showed. I did not demonstrate that cheap counting learns language from experience. I demonstrated that it finds word boundaries in a transcription somebody else produced, and that it degrades noticeably but not fatally as that transcription gets worse.

And the plan stands, just for a weaker reason. Before spending weeks on audio I want a method that holds up better than 1.8 times guessing under noise. It is close to the bar rather than nowhere near it.

There is a lesson in this one that I did not enjoy. I spent the evening carefully auditing myself for ways I might be fooling myself into good results. Then I accepted a negative result that rested entirely on a noise model I made up in five minutes and never questioned. Being suspicious of good news is only half the job.

## The zero knowledge claim needed one more correction

Late on I went back to test how stable the vowel finder is, since the whole chain sits on it. Ten runs at each noise level instead of one.

At 30 percent errors it gets the vowels right in 3 runs out of 10. Not degraded. **Flipped.** Every single run is either perfect or completely wrong, nothing in between.

The reason is specific and quite interesting. The algorithm splits the alphabet into two groups, and that split survives the noise perfectly well. What breaks is deciding **which of the two groups is the vowels**. It gets the answer right and then puts the wrong label on it.

I tried to fix it. Two other rules for choosing which group is which are completely stable under noise, right every time up to 40 percent errors. Then I checked them on the corpora that made me pick the original rule, and they fail badly there. One of them scores zero on the standard corpus. The original rule handles that one fine and dies under noise. A majority vote of all three does not help, because on the standard corpus two of the three are wrong together.

So there is no cheap rule that gets this right everywhere.

Which means my zero knowledge claim was slightly wrong. The chain works out everything by counting **except one single bit**: somebody has to say which of the two discovered groups is the vowels. One bit is not much. It is also not zero, and I said zero.

The honest version is that the chain is free except for one bit, and that bit is currently supplied by a rule that is right in some situations and wrong in others.

## Does any of this hold on a different problem?

Everything so far is one task: finding where words end. If cheap counting only works there, it is a curiosity.

So I tried a second, genuinely different task. Given text with no labels, sort the words into groups that correspond to nouns, verbs, adjectives and so on. Nobody tells the program what the categories are or how many words belong to each. It only gets to count which words appear next to which.

Putting everything in one group scores 0.170. Counting gets to 0.503.

Along the way I made it worse before I made it better. I added information about word endings, since -ing and -ed and -ly are strong clues in English. The score dropped from 0.434 to 0.353. That was a plain bug in how I combined two kinds of numbers, and fixing it took the score to 0.503. Worth mentioning because if I had stopped at the first result I would have written down "word endings do not help", which is nonsense.

Now the comparison that matters. On finding word boundaries, counting got 94 percent of the way to a published benchmark. Here it gets about 77 percent of what published methods manage.

So the claim holds up, but weakly. Counting does far better than nothing on both tasks. It just gets much closer to the state of the art on one than the other, which makes me think word boundaries are an unusually friendly problem for this kind of method rather than a typical one.

Two things stop this being a fair fight, and I would rather say them than let the number stand unqualified. The strong method for the second task is itself a counting method, just a much more careful one, so I am really comparing sloppy counting to careful counting. And I picked my settings by looking at the answers again, the same mistake as before, so the honest score is somewhere below 0.503 and I have not measured where.

## The last thing I tried was the best thing I found

By this point I had a clear diagnosis. Every method I had been using is computed from the same counts of what follows what, so when the input gets corrupted they all break together, and combining broken versions of the same measurement gets you nothing.

So I wanted a signal built on something else. There is an obvious one. The end of a sentence is always the end of a word. Nobody stops speaking halfway through a word. So the sounds that show up at the ends of sentences look like the sounds that show up at the ends of words, and you get that for free just from knowing where the sentences are.

This is not my idea. Two groups published it in the 1990s, both using neural networks trained to predict sentence endings. All I did was the counting version.

I was careful this time, because I had already been burned twice by picking settings that flattered me. I split the corpus in half, worked out all the counts and all the settings on one half, and scored the other half once.

It scored 0.838. Then I swapped the halves and got 0.837. Both picked the same settings independently, which felt solid.

So I tried harder to break it, and split the corpus five ways instead of two.

| Fold  | 1     | 2     | 3     | 4     | 5         |
| ----- | ----- | ----- | ----- | ----- | --------- |
| Score | 0.850 | 0.848 | 0.855 | 0.842 | **0.425** |

One fold at half the others. The five chunks are near identical in size and content, so it was not the data.

It was a bug, and a quiet nasty kind. About 70 percent of positions score exactly zero, because there is simply no evidence at those points. My code kept the top 30 percent of positions by score. When that cutoff lands exactly on zero, "keep everything scoring zero or above" means keep everything, and the program marks a boundary at every single position. Fold 1's cutoff landed a hair above zero and worked. Fold 5's landed exactly on zero and collapsed.

A coin flip, decided by where a percentile falls. My two-way split had landed on the lucky side twice.

The fix is obvious once you see it. A score of zero means no evidence, so it must never produce a boundary.

| Method                    | Five-fold average        |
| ------------------------- | ------------------------ |
| Sentence-edge counting    | **0.847** (spread 0.005) |
| Branching entropy         | 0.758                    |
| Goldwater 2009, published | 0.803                    |

**So counting beats the 2009 benchmark**, by 0.044, with everything learned on held-out folds and the five agreeing to within half a percent.

The caveats. Each run scores half the corpus where the published number is on all of it, so it is a close comparison and not an identical one. The idea belongs to Aslin and Christiansen, not me. And it leans hard on knowing where sentences end, which is given in the standard setup that everyone uses, so it is not cheating, but it is doing more of the work here than in other methods.

### And it works in every language I tried

One corpus is one corpus, so I ran the same five-fold test on seven more languages, taking sentence boundaries from punctuation.

| Language  | Sentence-edge | Branching entropy | Gap        |
| --------- | ------------- | ----------------- | ---------- |
| Finnish   | 0.609         | 0.418             | **+0.191** |
| Polish    | 0.631         | 0.449             | **+0.181** |
| Spanish   | 0.738         | 0.601             | +0.137     |
| Esperanto | 0.750         | 0.624             | +0.126     |
| Dutch     | 0.741         | 0.642             | +0.099     |
| English   | 0.847         | 0.758             | +0.089     |
| Italian   | 0.607         | 0.567             | +0.039     |
| German    | 0.640         | 0.604             | +0.036     |

Eight for eight. And English, the one I developed it on, is only sixth of the eight, which is the opposite of what tuning to your own corpus looks like.

The Polish row is my favourite thing from the whole day. Polish was the **worst** language for the vowel-based method, at minus 0.168, because Polish writes single sounds as letter pairs and the vowel finder produces garbage there. It is the **second best** language for this one.

The reason is that this method never looks for vowels. It only counts which sound patterns show up at the ends of sentences. So it walks straight past the broken component I had spent four experiments trying to repair, and which the oracle test then showed was not even what was holding things back.

I did not fix that problem. I went around it. That turned out to be worth more than fixing it would have been.

### It also fails the test I built it for

I did not build this to top a leaderboard. I built it because I wanted a signal that would break differently under noise.

It is the worst one I have tested. At 10 percent errors it drops 60 percent and then flatlines, while the method it beats on clean input only drops 31 percent. It needs exact matches at sentence edges, and corrupting sounds destroys those immediately.

So the best method on clean text is the most fragile one under noise. Which means the leaderboard I have been chasing all day is a poor guide to what would survive real audio.

That is a more useful thing to know than the 0.847.

## What actually stands at the end of the day

Thirteen times today my first version of a result was wrong. Eight too optimistic, four too pessimistic, one too confident. Two were bugs in the instruments I built to check myself with, which is its own lesson: a measuring device needs checking as much as the thing it measures. And three times I measured the limit of a family of methods and wrote it down as the limit of the problem. So it is worth listing what is left after stripping all of that out. These are the numbers I would defend.

- **0.881 on the standard corpus**, against the published 0.803. Five-fold cross-validation, everything learned on held-out folds, a few megabytes, seconds to run. The vocabulary half of that does not generalise, helping five of eight languages.
- **Word-to-word memory in the vocabulary helps all eight languages**, every one, by 0.008 to 0.024. The only thing tonight that generalised cleanly on the first test.
- **The sentence-edge part alone gets 0.847**, and it beats the next best method in all eight languages tested, by 0.112 on average. Neither idea is originally mine.
- **0.756 from a simpler method** on the same corpus, also blind, which is 94 percent of the benchmark from nothing but counting which letters follow which.
- **The near zero knowledge chain reaches 91.5 percent precision** on that corpus, the highest of anything I tested. It stays quiet a lot, but when it speaks it is nearly always right. It needs one bit of outside information: which of the two groups it discovers is the vowels.
- **Speech sounds are more data efficient than spelling.** Six measurements, all agreeing on direction, ranging from 2.2 to 13.5 times. The direction is solid. The size is not, and I spent part of the night quoting a precise range I could not support.
- **Whole grid program search cannot do ARC.** Proved exhaustively, not concluded from a low score.
- **The chain does badly in a language mostly when its vowel finder fails there**, which predicts the pattern at 0.66. Two earlier explanations failed. Two languages still do not fit.
- **On a second, different task the same approach reaches about 77 percent of published methods**, against 94 percent on word boundaries. So the claim generalises, but weakly.
- **It degrades substantially with realistic input errors**, holding about two thirds of its advantage at 30 percent sound-recognition error. My first version of this said it collapsed entirely, and that was a bad noise model.

The unexplained language variation and the noise sensitivity are not placeholders for something better. They are the honest state of it.

## The thing I actually learned about doing this

Two of today's mistakes were tidy numbers. A flat line that was really a weak method, and a clean 25 that was really the spacing of my own ruler. Both were caught by staring harder at data I already had. That is now a rule in my notes: if a number comes out suspiciously clean, check the ruler before you check the world.

One was the opposite. I spent all day saying I was behind the field, and I had simply never run on the field's corpus.

But the language result taught me the worst lesson of the three. That mistake was not visible in the data I had. Only going and getting more data exposed it. And it had passed a prediction I wrote down in advance, which I had been treating as close to proof.

It is not. A correct prediction on a small sample is still a small sample.

## What is next

The puzzle thread is dead as I framed it and I am not going to grind at it. The sound thread is where everything worked.

I thought I knew where to start. One component looked like it was carrying everything, the step that decides which symbols are vowels. It flips rather than degrades under noise, and it explains most of the difference between languages by failing on those that spell single sounds with letter pairs.

So I fixed it. Replaced the yes-or-no decision with a score that cannot flip. It worked exactly as intended and the overall result did not move.

Then I ran the test I should have run first. I handed the program the correct vowels for free, under noise. If knowing them perfectly is worth a lot, the component matters. It was worth **0.007**.

Four experiments on something one test would have cleared in five minutes. Find out how much a fix could possibly be worth before spending the evening building it.

Four different arrangements of these parts land in the same place, and the single best method on its own matches the best combination of them. Every one of these signals reads the same counts, so when noise damages the counts it damages all of them together. Combining several broken versions of the same measurement gets you nothing.

I concluded from that the noise was simply destroying the information, and that the target I had set was out of reach. Then, last thing tonight, I checked whether that was true instead of assuming it.

The way to check is to cheat on purpose. Train a program on the corrupted text while **showing it the right answers**, then test it normally. It cannot be beaten by anything that has to work the answers out for itself, so whatever it scores is the most that is available.

| Sound errors | Best honest method | With the answers | Gap    |
| ------------ | ------------------ | ---------------- | ------ |
| none         | 0.625              | 0.774            | +0.149 |
| 10 percent   | 0.545              | 0.693            | +0.147 |
| 20 percent   | 0.489              | 0.642            | +0.153 |
| 30 percent   | 0.439              | 0.595            | +0.157 |
| 40 percent   | 0.403              | 0.555            | +0.152 |

Two different things are going on and I had been treating them as one.

Noise really does destroy information. The best possible score falls from 0.774 to 0.555. That part is gone and no method gets it back.

But look at the gap. It is **the same 0.15 at every single noise level**, including no noise at all. My methods get about three quarters of what is available, and that shortfall does not grow as the input gets worse. It is a property of the methods, not of the corruption.

Which means my gloomy conclusion was wrong. At 30 percent errors the achievable score is two and a half times better than guessing. I had set myself a target of two times and decided it was out of reach. It is comfortably inside what the information supports. I am short because my methods leave a constant amount on the table, not because the noise caps me.

That is a much better problem to have. And the best place to attack it is at zero noise, where the same 0.15 gap exists and nothing else is going wrong.

So I did that, and it turned out my ceiling was not a ceiling.

First I got about a third of the way with a guess.

The cheating program looks at the text on **both sides** of a possible boundary. My method only ever looked forwards, at how surprising the next sound is given what came before. The same idea works backwards: how surprising is the previous sound, given what comes after. Half the available signal, unused all day, in every experiment.

Adding it takes the score from 0.636 to 0.676 against a ceiling of 0.774. So one obvious omission accounts for 29 percent of the gap. Two thirds of it is still unexplained, and the honest next move is to stop guessing at mechanisms and go and look at the specific places where the cheating program is confident and mine is not.

Then I stopped guessing and looked. Which boundaries does the cheating program find that mine misses?

Rare words. The words either side of a missed boundary turn up about a third as often as the words either side of an easy one. And the actual examples are nearly all names:

    fellow | whig       h | seward       hill | lamon
    belz | herman       hoosier | youth  savage | kirk

The cheating program has quietly memorised a vocabulary. My method has no memory of words at all. It only ever asks how surprising the next sound is. It has no concept that "seward" is a thing.

So I tested that before building anything, which is the lesson I had already learned the hard way once tonight. I handed the program a perfect list of every word in the text.

| Method                                    | Score     |
| ----------------------------------------- | --------- |
| My best honest method                     | 0.661     |
| The cheating program                      | 0.755     |
| A list of only the words seen in training | 0.751     |
| **A perfect word list**                   | **0.944** |

The perfect word list beats the "cheating" program by 0.19. Which means the thing I had been calling a ceiling was not a ceiling at all. It was the limit of one particular _kind_ of method, the kind that looks at a fixed window of nearby sounds. A vocabulary is not that kind of method. It remembers whole words of any length, so it lives outside the bound I drew.

I have now made the same mistake three times tonight in the same area. Each time I measured how well a family of methods can do, and each time I wrote it down as how well the _problem_ can be done.

The real headroom is at least 0.28, not the 0.15 I reported, and the missing ingredient is a vocabulary. Which is not news. Every serious method in this field since the 1990s builds one. I just did not have one, and it took looking at actual examples rather than reasoning about it to see that.

The encouraging bit: a list containing only words already seen during training scores 0.751, and that is something a program could plausibly build for itself.

So I tried to build one. Take the boundaries the method is most sure about, collect whatever sits between them, keep the pieces that turn up often, use those to help find more boundaries, repeat.

It went from 0.661 to **0.671**. Positive, and small. About a tenth of what a proper vocabulary would be worth.

Getting even that took two wrong turns, and the second one is the reason I am writing this section rather than a different one.

The first attempt made things worse, 0.613, which makes sense. My method is right about two thirds of the time, so a third of the pieces it collects are not words at all, and those then vote for the same wrong boundaries. Errors feeding themselves.

I then tried only collecting from the boundaries it was most confident about. Six different settings. All of them still worse. At that point I was ready to write down that this approach does not work.

Then I ran the control I should have run first. I checked what my method scores **on its own** when measured the way the new code measures things. Not 0.661. **0.603.** The two were using different rules for deciding how many boundaries to mark, and that difference alone was worth 0.058.

So the vocabulary had been helping the whole time. I had changed two things at once and blamed the one I was interested in.

That is the second time tonight I did exactly that. Earlier I compared my scores on hard text against published scores on easy text and concluded I was far behind the field. Same shape of mistake, four hours apart.

Both are cheap to avoid and I now have a rule written down for it: before deciding an idea failed, run the version that changes only the plumbing.

So I tried the obvious next thing. A two-thirds-accurate method cannot build a vocabulary much better than itself, but the sentence-edge method is right 85 percent of the time. Build the vocabulary from that instead.

It works, and the chain is clean enough to read straight off the table.

| Vocabulary built from               | How much of it is real words | Lifts my method to |
| ----------------------------------- | ---------------------------- | ------------------ |
| the real answers                    | 100 percent                  | 0.857              |
| sentence edges, 85 percent right    | 70 percent                   | **0.826**          |
| branching entropy, 76 percent right | 50 percent                   | 0.758              |

Starting point was 0.708. So a vocabulary built from the better source lifts it by 0.118, with nothing supervised anywhere. My earlier 0.010 was not a limit of the idea. It was a limit of harvesting words from a source that was wrong a third of the time.

And the quality of the vocabulary tracks the quality of the source almost exactly. 50 percent real words from the weak source, 70 from the better one, 100 from the answers. That is about as clean a mechanism as I have measured today.

There is a catch, and it is the same catch as twice before tonight. None of this beats the sentence-edge method on its own, which sits at 0.841. Because the vocabulary was built _from_ sentence edges, it mostly tells that method things it already knows. I combined two things made from the same underlying counts and got nothing, for the third time today.

The useful part is what the top row shows. A _perfect_ vocabulary still adds 0.041 on top of the sentence-edge method. So there is real information there that an edge-built vocabulary is missing.

So I went and looked at which real words it fails to contain, and the answer was not what the summary numbers implied.

By the numbers it misses rare words. Recall runs from 24 percent for words appearing three to five times, up to 91 percent for the most frequent. A perfectly clear gradient, and the explanation it suggests is wrong.

Look at the actual entries. The word `wan6`, which is _want_, appears **226 times** and is missing. Meanwhile `wan`, which is not a word at all, is in the vocabulary. Same story throughout: the missing entries are common little words that live inside phrases, _want to_, _at the_, _out of_, and the junk entries are their chopped-off fragments.

So it is not a rarity problem. It is a **truncation** problem. Chopping a word in half makes the fragment short and frequent and the real word absent, which produces exactly the rarity gradient I was staring at.

That pointed at an obvious fix, and I bounded it before building, because that lesson had already cost me an evening once. If the vocabulary is chopping words in half, let it also try gluing neighbouring pieces back together. I checked whether the missing words are even reachable that way. **Three out of ten.** Words like `&t` have neither of their edges proposed in the first place, so no amount of gluing finds them. The bound killed the idea in five minutes.

Which pointed somewhere better. The problem with collecting words from _between_ boundaries is that you can only ever find words some other method already outlined. So stop doing that. Instead consider **every possible way of cutting up each sentence**, score each one by how well its pieces match the vocabulary, and keep the best. That can propose cuts nothing suggested, which is exactly the population that was missing.

| Method                                      | Five-fold average |
| ------------------------------------------- | ----------------- |
| Branching entropy                           | 0.758             |
| Goldwater 2009, published                   | 0.803             |
| Sentence edges                              | 0.847             |
| **Sentence edges plus vocabulary decoding** | **0.867**         |

Best number of the day. All five folds improve, the settings were chosen on held-out data, and it runs in seconds on a few megabytes.

One detail I enjoyed. I expected to need a penalty for using lots of short words, because my notes from earlier in the evening say this kind of objective is happiest declaring the whole sentence to be one long word. The best penalty turned out to be zero, and any penalty at all made things much worse. Two other limits already prevent the collapse: words are capped at nine sounds and have to appear at least twice. My earlier note was right about the maths and irrelevant to the actual program.

And the honest lesson from this stretch. The vocabulary idea gave 0.010 on the first try and looked finished. Changing where the vocabulary came from gave 0.118. Replacing collection with decoding gave the best result of the day. Three adjustments to one idea. If I had written it off at the first number, which I nearly did, I would have been wrong by a mile.

## Then I tried to break the best result, and half broke it

The sentence-edge part had held up in all eight languages. I assumed the vocabulary part would too. It does not.

| Language  | Gain from adding vocabulary decoding |
| --------- | ------------------------------------ |
| German    | +0.038                               |
| Dutch     | +0.031                               |
| English   | +0.020                               |
| Esperanto | +0.006                               |
| Spanish   | -0.001                               |
| Italian   | -0.044                               |
| Polish    | -0.054                               |
| Finnish   | -0.072                               |

Average across the eight: **slightly negative.** So the 0.867 is real on the standard English corpus, which is the corpus the published 0.803 was measured on, and it is not a general improvement. Four languages gain, three lose.

I had one obvious explanation. English child speech repeats each word about 25 times; the literary texts repeat each word two to five times. A vocabulary built from a corpus with little repetition should be mostly entries backed by almost no evidence.

So I let each language choose for itself how suspicious to be of rare entries, deciding it on held-out data. Every single language chose the _least_ suspicious setting available, and the results did not budge. The data rejected my explanation rather than just failing to support it, which is a cleaner answer than I usually get.

There is a tidy-looking pattern. The four that gain are Germanic or artificial. The three that lose are Romance, Slavic and Finnish, which are all more heavily inflected. And the repetition measure correlates with the gain at -0.77.

I am not going to claim either as the cause. The two explanations are tangled together, since the most inflected languages are also the least repetitive ones. And inside the Germanic group the repetition relationship runs backwards. Eight data points with two overlapping explanations and a contradiction inside them is exactly the situation that burned me earlier tonight with the spelling-depth result.

What I can say is where to look next, and it is not a guess. My vocabulary treats each word as independent of its neighbours. Goldwater's 2009 paper, the one I keep comparing against, found precisely that this kind of model glues common pairs together, because nothing in it can express that _want to_ is two words that simply travel together. Their fix was to model word-to-word transitions, and that fix is where their 0.803 comes from.

Which matches what I found by looking at the missing words earlier: they were the little function words that live inside phrases. Two different routes to the same next step.

## So I did that, and it is the best result of the day

I gave the vocabulary a memory of which words follow which. Instead of scoring each word on its own, score each word given the word before it.

**0.881.** All five folds improve. The settings were chosen on held-out data. That is 0.078 above the published benchmark I have been measuring against all night.

And it fixed exactly the thing I predicted it would. I checked what words my program was inventing before the change, and the picture was unambiguous. Its words were too long: an average of 3.15 sounds against a true 2.87. It had glued `look at` into a single word 154 times. It produced the word `at` **zero** times, where the real answer has it 198 times. Same for `of`: 147 real, zero produced.

The reason is simple once you see it. Using two words costs the program two penalties where one word costs one, so it is always slightly biased toward gluing things together. Word-to-word memory fixes that by letting it say "look is often followed by at" instead of needing "lookat" to be a word.

## And that exposed a mistake in my own earlier sweep

Once I understood the gluing bias, an obvious alternative fix appeared. If the program is biased toward too few words, give it a small **bonus** for using more of them.

Then I checked my notes and found I had already tested this. I had swept that setting over the values 0, 2, 4, 6 and 8, found 0 was best, and written it down as the answer.

I had never tried a negative value. My "best" setting was sitting at the very edge of the range I searched, which should have told me the range was wrong rather than that I had found the optimum.

Testing it properly: a bonus of minus one lifts the simpler version from 0.867 to 0.871, and pulls the average word length from 3.07 down to 2.91, against a true 2.87. So the diagnosis was right and the fix works.

It also makes the _better_ version slightly worse, 0.881 down to 0.876, because word-to-word memory already solves the same problem. Two fixes for one bug, and they do not stack.

## A number I should have been reporting, and one I cannot verify

Two things came out of going back to the literature late on.

**First, there is a stricter way to score this and I had not been using it.** Counting boundaries correctly is the easy measure. The harder one counts whole words, and a word only counts if _both_ of its edges are right. The papers report both. I had only ever computed the easy one.

| Method                       | Boundaries | Whole words |
| ---------------------------- | ---------- | ----------- |
| Sentence edges               | 0.847      | 0.711       |
| Plus vocabulary              | 0.867      | 0.779       |
| **Plus word-to-word memory** | **0.881**  | **0.791**   |
| Goldwater 2009, published    | 0.803      | 0.624       |

The gap is **bigger** on the harder measure. 0.167 ahead on whole words against 0.078 on boundaries. That is an unusual direction for tonight's mistakes to run, since almost all the others were in my favour and had to be corrected downward.

**Second, and less comfortably: I cannot tell you whether 0.881 is any good in absolute terms.**

I have spent this entire day measuring myself against one paper from 2009. That comparison is real and I have been careful about it. But it is one paper, and better methods have certainly been published since.

I went looking. I found references to a nested Pitman-Yor model reported at 88.6 percent on the whole-word measure, to adaptor grammars, and to a framework claiming the best scores to date. **I could not retrieve the actual numbers for any of them on this corpus.** The PDFs would not extract. One paper I chased turned out not to use this corpus at all. And that 88.6 figure may well be for Japanese or Chinese rather than English.

So the honest version is narrow, and I would rather say it plainly than let the headline imply more. **This beats one specific well-known 2009 result on the corpus that result used.** It is not established as the best anyone has done. If that 88.6 number is on this corpus, then a paper from the same year as my comparison point is comfortably ahead of me on the stricter measure.

## Three more things I tried that did not work

Worth recording since the successes above make the night look tidier than it was.

The vocabulary was missing some long, common words entirely: `daddy` appears 71 times in the real answer and my program produced it **zero** times. So I tried three ways to get them in.

Re-running the whole estimation loop repeatedly, so each better guess feeds the next: **converged after one round, plus 0.001.** A program cannot learn from words it never produces.

Adding every reasonably common chunk of sounds as a candidate word and letting the decoder choose: **0.849, worse.** The candidate list was 12,000 entries of which only 5 percent were real words, and that dilution cost more than the missing words gained.

Adding only the very short common chunks, since the other thing being lost was little function words: **0.872, still worse.**

Three failures with one lesson. I had read my own diagnostic as "those words are missing from the list". The correct reading is "the perfect version _knows_ those words belong". Handing my program the words without the knowledge that they are words does not help, it just gives it more ways to be wrong.

## The one thing tonight that generalised cleanly

Here is the part I did not expect. The word-to-word memory helps in **all eight languages**, every single one, by between 0.008 and 0.024.

That is true even in the four languages where the whole vocabulary approach loses to plain sentence-edge counting. So there are two separate questions with two separate answers. _Should you use a vocabulary at all_ depends on the language. _If you do, should it have word-to-word memory_ is just yes, everywhere.

I would not have found that by testing on English alone, and I nearly did not test the rest.

That is a sharper place to begin than where I started today, with five experiments that were all already published.

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
