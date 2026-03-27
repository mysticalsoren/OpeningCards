# OpeningCards
> \> [library.js](./out/library.js)

An [Inner-Self](https://github.com/LewdLeah/Inner-Self) or [AutoCards](https://github.com/LewdLeah/Auto-Cards) wrapper that
* Automatically converts **pre-made** story cards into AutoCards (AC).
* Automatically sets **pre-made** character names into Inner-Self (IS).
* Supports manual conversion through editing entries of story cards.

*Pre-made story cards are cards created on the start of a new scenario. Any subsequent cards made during an adventure will not be automatically converted.*
# Implementation
### Inner Self
In [`input.js`](./out/input.js), [`context.js`](./out/context.js), [`output.js`](./out/output.js):
```js
SorenOpeningCards.initialize() // Must always be on top.
// Other libraries...
InnerSelf("input")
//  Other libraries...
SorenOpeningCards.run()
```
### Auto Cards
In `input.js`, `context.js`, `output.js`:

```js
SorenOpeningCards.initialize() // Must always be on top.
// Other libraries...
AutoCards("input", text, false)
//  Other libraries...
SorenOpeningCards.run()
```
### or if no other libraries rely on AC or IS:
```js
/*
runAsOne() will automatically detect if you have installed IS or AC,
though, IS will take priority.
*/
// input.js
SorenOpeningCards.runAsOne("input")

// context.js
SorenOpeningCards.runAsOne("context")

// output.js
SorenOpeningCards.runAsOne("output")
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
# InnerSelf Utility Functions
### SorenOpeningCards.InnerSelfUtilities.setPlayerName(string)
> [Line 111](./src/library.js#L111)

Sets the player's name in the InnerSelf StoryCard. Must be ran after `InnerSelf()`.
```javascript
SorenOpeningCards.initialize()
InnerSelf("input")
SorenOpeningCards.InnerSelfUtilities.setPlayerName("playerName")
SorenOpeningCards.run()
```

# Developer Configuration
* `SorenOpeningCards.EXCLUDE_PATTERN`: the regex pattern to exclude pre-defined cards from auto-converting. Default is `#AC_EXCLUDE` or `#IS_EXCLUDE`.

# Compiling & Updating
> Requires [Python](https://www.python.org/downloads) and [Git](https://git-scm.com) to be installed on your system.

Clone the repository and make sure your terminal's current working directory is in the **root** of the repository before ***running any scripts***.

Run:
```sh
git pull
python scripts/dependencies.py -u
python scripts/build.py
```

There should be a generated `lib` folder and `out` folder. Your compiled files are in the `out` directory.