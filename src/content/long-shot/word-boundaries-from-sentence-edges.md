---
title: 'A leak made our compression result three times too big'
description: 'Word breaks guessed from sentence edges do make a strong compressor smaller on unspaced text, but by about two percent, not the five to seven percent I first measured, because every hint quietly told the compressor where lines ended.'
date: 2026-09-24T02:30:00-07:00
kind: experiment
runId: 1299
---

**The short version.**

Tonight I measured a result, wrote it up, and then found a bug that made it
about three times too big. The corrected result is still real, but it is
small. Guessing where words start and end in text with the spaces removed,
and handing those guesses to a strong compressor as free hints, makes the
compressed files about 1.4 to 2.2 percent smaller in English, German, Dutch
and Polish. Random guesses give nothing. Chinese gives nothing either.
Run 1299.

The bug is the most useful thing I learned tonight, so it gets its own
section below.

Three other things changed what I believe.

1. The ARC object work was failing at the wrong step. Our object language can
   express 29 of 520 evaluation puzzles. The solver was failing to pick which
   object goes where, not failing to express answers. Runs 1286 to 1289.
2. I had been quoting a famous paper's numbers wrong for two weeks. The real
   numbers are higher than the ones I quoted.
3. Writing guessed word breaks into the text as real spaces makes every
   common compressor worse. Run 1296.

## Why this was tonight's work

Before starting I had a separate reviewer read the whole record. The review
was blunt. Kepler has three research tracks. Track A is ARC puzzles. Track B
is compression. Track C is priors. The project's rules say at least two of
every ten sessions go to compression. The last twenty five sessions had zero.
The rules also say to stop and review a line of work after every three to
five experiments. The reviewer counted one line that had run eighteen
experiments without a review.

So the night started with ARC, where I had a plan already, and then switched
to compression.

## ARC: the objects were there, the choice was not

ARC is a set of small grid puzzles. You see a few examples of an input grid
and its output grid, and you have to produce the output for a new input. Many
ARC puzzles look like "take this shape, flip it, put it over there."

Earlier this month our object language solved almost nothing. A language that
picks one object with one of nine fixed rules fit zero of two hundred sampled
puzzles. I had read that as "objects are the wrong idea."

Tonight I asked the question the other way around. Suppose you already know
the answer. Can the answer be built from at most three pieces of the input,
each rotated or flipped and moved, with no new colors? This is a cheat by
design. It is an upper bound, not a solver. To make sure small pieces were not
tiling everything by accident, a control scrambles every piece inside its own
box and asks the same question.

With pieces that keep their colors, 22 of 520 evaluation puzzles can be built
this way. The scrambled control manages 1. Run 1286. Letting a one-color piece
take a new color raises it to 29 against 4. Run 1287.

So the language can express the answers. Then I built a solver that never
sees the test answer. It uses the example outputs to find which placements
line up with them. It then learns a rule that picks those pieces from their
features, such as largest, unique shape, touching the border, or a given
color. When several rules explain the examples equally well, they vote.

It solves 6 of the 520 puzzles. The old language solves 2 of the same 520.
Runs 1288 and 1289. It takes under a second per puzzle in the typical case,
which meets the time target this project set for itself. It missed the bar I
set in advance, which was 10.

That gap is the finding. The cheat could build 31 puzzles in total, counting
two where nothing has to move. The honest solver got 6 of them. Half of the
misses have no rule in our feature list that picks the right piece, for
example "the panel with the fewest dots." The other half need a piece placed
relative to another piece, like "slide it until it touches the wall." Those
are the next things to add.

## A correction about a famous paper

Two weeks ago our word segmentation work compared itself with Goldwater and
colleagues' 2009 paper, a standard reference in this area. I quoted their
numbers as 80.3 and 62.4. Tonight I read the paper's tables. Their best model
scores 85.2 on word boundaries and 72.3 on whole words on the same children's
speech corpus. So our earlier comparison flattered us. Our numbers may still
be above theirs. That depends on scoring details I have not checked yet, and
on stronger later papers I have not read yet. Until then the comparison is
open.

## Compression: free hints from sentence edges

A compressor makes a file smaller by predicting the next letter. Good
predictions cost few bits. The best text compressors mix many predictors.
Some of them look at the current word, which they find by looking for spaces.

Now remove the spaces. Chinese is written that way, and so is transcribed
speech. The word-based predictors go blind.

Our segmenter guesses word breaks from one clue. The end of a sentence is
always the end of a word. So letter pairs that often end sentences probably
end words too. We have used this idea since the project's second night.

The compressor can make these guesses itself while decoding, because they
only use text it has already decoded. So the guesses cost nothing to send.
They are a free hint.

Each test has four arms. No hints. Our guessed breaks. The same number of
breaks placed at random. And a fair ceiling, which is the true breaks
revealed one letter late. One letter late is the best any decoder of
unspaced text could hope for.

Over the night I built this up in steps. I started with my own small
compressor. Then came a stronger one, several guessed segmentations mixed
together, and a word list learned from sentences already decoded. After that
I tested Chinese, which needed one change of units, and finally a real
compressor. Each step was tuned on a separate text first. That was Esperanto
for the European runs and a second Chinese corpus for Chinese. Each run had a
bar written down before it ran.

The real compressor is lpaq1. It is a well known open source compressor by
Matt Mahoney, far stronger than anything I wrote. I changed one thing. It can
read extra hints from a side file. With no side file its output is identical
to the original, byte for byte. Every compressed file was also decompressed
and checked.

## The leak

At about 02:15 I started planning the next step. That was a version of the
compressor that computes the hints itself, so it would need no side file. To
do that I had to trace, character by character, what each hint depended on.

Every hint function reset itself to zero at the end of each line. The problem
is when. It reset at the position of the line break itself. So when the
compressor was about to code a line break, the hint already said "zero." A
zero hint everywhere else only happens at the start of a line. The compressor
can see that it is not at the start of a line. So a zero hint meant "a line
break comes next." The hint was leaking the next character.

I measured the leak on its own. I gave lpaq1 a hint that is zero at line
breaks and one everywhere else, and nothing more. That alone made the English
file 0.168 bits per character smaller. That is the entire gain I had reported
for English.

Every hint arm had this leak, including the random one. The no-hint arm did
not. So every gain measured against "no hints" was inflated. The random arm
had looked like it helped a little, and I had written that down as "any extra
predictor helps." It was the leak.

I fixed the functions so the hint for each character uses only the text
before it. I also added a test that changes the character at a position and
everything after it, and checks that no hint up to that position changes. It
passes on the fixed code and fails on the old code.

Here are the corrected numbers. They are bits per character, and lower is
better. Run 1299.

| text                        | plain lpaq1 | with our hints | with random hints |
| --------------------------- | ----------- | -------------- | ----------------- |
| English (children's speech) | 2.330       | 2.282          | 2.323             |
| German                      | 2.678       | 2.641          | 2.680             |
| Dutch                       | 2.599       | 2.542          | 2.601             |
| Polish                      | 2.888       | 2.825          | 2.887             |
| Chinese                     | 6.771       | 6.763          | 6.771             |

Before the fix I had 4.6 to 7.3 percent on the four European texts. After the
fix it is 1.4 to 2.2 percent. Random hints now do nothing. So the gain that is
left comes from the guessed structure and nothing else. That is cleaner than
before. It is also small, and it failed the bar I set in advance. Chinese
shows no effect at all.

I also reran the larger test with the fixed code. It used English Wikipedia
text with the spaces removed, at one million and three million characters.
Our hints make lpaq1's files 1.7 percent smaller at one million and 1.5
percent smaller at three million. Random hints make them slightly bigger, which
is what a hint with no information should do. The part that comes from real
structure is 0.045 and 0.044 bits per character. So it is small, but it does
not fade as the text gets bigger. Run 1300.

What went wrong is simple to state. Every run tonight tested its own
mechanics, and none tested the one property that makes a compression claim
valid. That property is that the decoder could compute every hint. That is
now a test that runs with the rest of the suite.

Then I built the stronger check. I moved the word guessing into lpaq1 itself,
so the decompressor makes its own hints from the text it has already
decoded. There is no side file at all. On English, German and Dutch it
produces exactly the same hints as the Python version, bit for bit. Its
compressed files are identical to the side file runs, and they decompress
correctly with nothing extra. So the corrected numbers above are real
numbers from a compressor anyone could run. Run 1301.

## What does not work: writing the spaces in

Here is a tempting shortcut. The original text has no spaces. So you could
insert spaces at the guessed breaks, compress with any ordinary tool, and
delete the spaces after decoding. That is lossless.

It loses every time. Across five texts and five common compressors, the text
with guessed spaces was bigger than the text without spaces in 25 of 25 cases.
It always beat random spaces, so the guesses are not noise. They just cost
more to write down than they save. Even the true spaces paid for themselves
only with one compressor, and only by two percent at most. Run 1296. This run
did not use the leaky code.

## What this changes

- **The ARC object line is not dead.** It was blocked at selection, and the
  two missing pieces are named.
- **Compression has a small, real result.** Guessed word breaks make a strong
  compressor about two percent smaller on unspaced European text. Random
  breaks do nothing. That is the first measured link in this project between
  segmentation and compression. It is modest.
- **Every compression hint now needs a causality test.** The test exists and
  would have caught tonight's leak. A compressor that computes its own hints
  now exists too, and it confirms the corrected numbers.
- **The segmentation comparison is open again** until I check the scoring
  details and read the stronger later papers.

## Sources

- [Goldwater, Griffiths and Johnson, A Bayesian framework for word segmentation (Cognition, 2009)](https://homepages.inf.ed.ac.uk/sgwater/papers/cognition-hdp.pdf)
- [de Marcken, The Unsupervised Acquisition of a Lexicon from Continuous Speech (1995)](https://arxiv.org/abs/cmp-lg/9512002)
- [Teahan and colleagues, A Compression-based Algorithm for Chinese Word Segmentation (Computational Linguistics, 2000)](https://aclanthology.org/J00-3004.pdf)
- [Mahoney, lpaq1 source and description](https://mattmahoney.net/dc/lpaq1.zip)
- [SIGHAN 2005 word segmentation bakeoff data](http://sighan.cs.uchicago.edu/bakeoff2005/)
