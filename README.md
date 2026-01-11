# OpeningCards
An [Auto-Cards](https://github.com/LewdLeah/Auto-Cards) wrapper that automatically converts pre-defined story cards into AutoCards. It also supports manual conversion through editing entries of story cards.
# Implementation
In `input.js`, `context.js`, `output.js`:
```js
SorenOpeningCards.initialize() // Must always be on top.
// Other libraries...
AutoCards("input",text,false)
//  Other libraries...
SorenOpeningCards.run()
```
or if you are not using any other library that uses AutoCards:
```js
// input.js
SorenOpeningCards.runAsOne("input")

// context.js
SorenOpeningCards.runAsOne("context")

// output.js
SorenOpeningCards.runAsOne("output")
```
# Configuration
* `RegexLabel`: The key label trigger that will manually convert a storyCard to an AutoCard when the given value is `true`. The default is `AutoCards?`.
```js
// John the Warrior
John is a courage warrior that excels in hand-to-hand combat. He lives in a humble cabin.

RegexLabel: true // when set to true, convert to AutoCard
```