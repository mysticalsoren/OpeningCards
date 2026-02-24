# OpeningCards
An [Inner-Self](https://github.com/LewdLeah/Inner-Self) or [AutoCards](https://github.com/LewdLeah/Auto-Cards) wrapper that
* Automatically converts **pre-made** story cards into AutoCards.
* Automatically sets **pre-made** character names into Inner-Self
* Supports manual conversion through editing entries of story cards.

*Pre-made story cards are cards created on the start of a new scenario. Any subsequent cards made during an adventure will not be automatically converted.*
# Implementation - Inner Self
In `input.js`, `context.js`, `output.js`:
```js
SorenOpeningCards.initialize() // Must always be on top.
// Other libraries...
InnerSelf("input")
//  Other libraries...
SorenOpeningCards.run()
```
or if you are not using any other library that uses Inner Self:
```js
// input.js
SorenOpeningCards.runAsOneInnerSelf("input")

// context.js
SorenOpeningCards.runAsOneInnerSelf("context")

// output.js
SorenOpeningCards.runAsOneInnerSelf("output")
```
# Implementation - AutoCards
In `input.js`, `context.js`, `output.js`:
```js
SorenOpeningCards.initialize() // Must always be on top.
// Other libraries...
AutoCards("input", text, false)
//  Other libraries...
SorenOpeningCards.run()
```
or if you are not using any other library that uses AutoCards:
```js
// input.js
SorenOpeningCards.runAsOneAutoCards("input")

// context.js
SorenOpeningCards.runAsOneAutoCards("context")

// output.js
SorenOpeningCards.runAsOneAutoCards("output")
```
# Configuration
* `RegexLabel`: The key label trigger that will manually convert a storyCard to an AutoCard when the given value is `true`. The default is `AutoCards?` or `InnerSelf`. Either option will do the same regardless of naming scheme.
```js
// John the Warrior {StoryCard Entry}
John is a courage warrior that excels in hand-to-hand combat. He lives in a humble cabin.

// Any of these will convert the StoryCard into a AutoCard.
AutoCards: true
AutoCard: true
InnerSelf: true
aUtOcArD: true // Capitation doesn't matter.
iNnErSeLf: true
```
# Developer Configuration
* `SorenOpeningCards.EXCLUDE_PATTERN`: the regex pattern to exclude pre-defined cards from auto-converting. Default is `#AC_EXCLUDE` or `#IS_EXCLUDE`.
# Deprecated Method(s)
* `SorenOpeningCards.runAsOne()` - Redirects to `SorenOpeningCards.runAsOneInnerSelf()`
