class SorenOpeningCards {
    static get DEBUGGER() {
        return MysticalSorenUtilities.Debugger(this.name)
    }
    static EXCLUDE_PATTERN = "(?:#AC_EXCLUDE)|(?:#IS_EXCLUDE)"
    static InnerSelfUtilities = {
        /**
         * Returns a StoryCard matching the internal Regex on the StoryCard's title property.
         * @returns {StoryCard} StoryCard. The InnerSelf StoryCard
         */
        getStoryCard() {
            for (const storyCard of storyCards) {
                if (storyCard.title.match(/^Configure\s*Inner\s*Self\s*$/gim)) {
                    return storyCard
                }
            }
            return null
        },
        /**
         * Gets the characters from the InnerSelf StoryCard.
         * @param {StoryCard} innerSelfStoryCard The InnerSelf StoryCard. If left empty, it will default to the InnerSelfUtilities.getStoryCard()
         * @returns {String?} String?. A comma-separated string of characters found in InnerSelf StoryCard. 
         */
        getStoryCardCharacters(innerSelfStoryCard = this.getStoryCard()) {
            if (!MysticalSorenUtilities.hasKeys(innerSelfStoryCard)) {
                SorenOpeningCards.DEBUGGER.log("Could not get characters as Inner-Self Story Card is empty!")
                return
            }
            const innerSelfComment = /^>\s*.+$/gm // /^>\s*Write.*priority:$/im
            let idx = innerSelfComment.lastIndex
            let match = null
            do {
                match = innerSelfComment.exec(innerSelfStoryCard.description)
                idx = innerSelfComment.lastIndex > idx ? innerSelfComment.lastIndex : idx
            } while (match !== null);
            if (idx > 0) {
                return innerSelfStoryCard.description.substring(idx).trim().replace(/\n/g, ',')
            }
        },
        /**
         * Adds characters to the InnerSelf StoryCard if not already existing.
         * @param {StoryCard} innerSelfStoryCard The InnerSelf StoryCard. If left empty, it will default to the InnerSelfUtilities.getStoryCard()
         * @param {String} characterNames a comma-separated list of first names to be added into the InnerSelf StoryCard
         * @returns {void}
         */
        addEntry(innerSelfStoryCard = this.getStoryCard(), characterNames = "") {
            if (!MysticalSorenUtilities.hasKeys(innerSelfStoryCard)) {
                SorenOpeningCards.DEBUGGER.log("Could not add entry as Inner-Self Story Card is empty!")
                return
            }
            if (characterNames === "") {
                SorenOpeningCards.DEBUGGER.log("Could not add entry as the name to be added is empty!")
            }

            const characters = this.getStoryCardCharacters(innerSelfStoryCard)
            if (typeof characters == "string") {
                if (characters !== characterNames) {
                    characterNames.split(',').forEach((characterName) => {
                        if (!characters.includes(characterName)) {
                            if (innerSelfStoryCard.description.endsWith('\n')) {
                                innerSelfStoryCard.description += `${characterName}\n`
                                return
                            }
                            innerSelfStoryCard.description += `\n${characterName}`
                        }
                    })
                }
            }
        },
        /**
         * Gets the first name of a StoryCard by stopping at the first leftmost space character.
         * @param {StoryCard} storyCard The StoryCard to get the first name of
         * @returns {String} String. A substring of the StoryCard.title
         */
        getFirstName(storyCard) {
            if (!MysticalSorenUtilities.hasKeys(storyCard)) {
                SorenOpeningCards.DEBUGGER.log("Could not get first name as the given story card is empty!")
                return
            }
            let space = storyCard.title.indexOf(' ')
            space = space > -1 ? space : storyCard.title.length
            return storyCard.title.substring(0, space)
        }
    }
    /**
     * @typedef SorenOpeningCardsUserConfiguration
     * @property {string} RegexLabel the manual conversion pattern
     */
    /**
     * @typedef SorenOpeningCardsConfiguration
     * @property {Array<String>} cards a list of StoryCard IDs during initiation. StoryCards in here are considered "OpeningCards".
     * @property {Number} configId Configuration StoryCard ID
     * @property {SorenOpeningCardsUserConfiguration} config the User's configuration
     * @property {string} innerSelfCharacters InnerSelf's comma-separated character(s) string
     */
    /**
     * Generates or gets the configuration from state.
     * @returns {SorenOpeningCardsConfiguration}
     */
    static getConfig() {
        return MysticalSorenUtilities.AIDungeon.getState(this.name, {
            cards: [],
            configId: -1,
            config: {
                RegexLabel: "(?:AutoCards?)|(?:InnerSelf)"
            },
            innerSelfCharacters: (typeof MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS == "string") ? MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS : ""
        })
    }
    /**
     * Loads and updates state to respect user's configuration.
     * @returns {SorenOpeningCardsConfiguration} Object. The updated configuration with respect to the user's choices.
     */
    static loadUserConfig() {
        const config = this.getConfig()
        const createConfigCard = () => {
            const card = MysticalSorenUtilities.AIDungeon.addStoryCard(`${this.name} Configuration`, "", JSON.stringify(config.config, (_, value) => {
                return value
            }, 1), "configuration", "")
            config.configId = Number(card.id)
            MysticalSorenUtilities.AIDungeon.setState(this.name, config)
            return card
        }
        if (config.configId === undefined || config.configId < 0) {
            createConfigCard()
            return config
        }
        const idx = MysticalSorenUtilities.AIDungeon.getStoryCardIndexById(config.configId)
        if (idx < 0) {
            createConfigCard()
            return config
        }
        const card = storyCards[idx]
        try {
            config.config = JSON.parse(card.description)
            MysticalSorenUtilities.AIDungeon.setState(this.name, config)
        } catch (error) {
            removeStoryCard(idx)
            createConfigCard()
            card.description = `${error}`
        }
        return config
    }
    /**
     * Gets all the StoryCards present at the current turn order and puts them into a queue for conversion.
     * 
     * StoryCards with the `SorenOpeningCards.EXCLUDE_PATTERN` in its content will be excluded from the queue.
     * 
     * Note: This function only runs once.
     * @returns {void}
     */
    static initialize() {
        const config = this.getConfig()
        if (MysticalSorenUtilities.hasItems(config.cards)) {
            return
        }
        const exclude_regex = new RegExp(`^${this.EXCLUDE_PATTERN}$`, "gim")
        storyCards.forEach(storyCard => {
            if (storyCard.entry.match(exclude_regex)) {
                storyCard.entry = storyCard.entry.replace(exclude_regex, "")
                storyCard.entry = storyCard.entry.trim()
                return
            }
            if (config.innerSelfCharacters.includes(storyCard.title)) {
                return
            }
            config.cards.push(storyCard.id)
            config.innerSelfCharacters += `${this.InnerSelfUtilities.getFirstName(storyCard)},`
        })
        if (config.innerSelfCharacters.endsWith(',')) {
            config.innerSelfCharacters = config.innerSelfCharacters
                .substring(0, config.innerSelfCharacters.length - 1)
        }
        MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS = config.innerSelfCharacters
        MysticalSorenUtilities.AIDungeon.setState(this.name, config)
    }
    /**
     * Converts StoryCards currently in queue or matches the pattern found in the User's Configuration.
     * @param {"input" | "context" | "output"} context Is it running in "input" or {...} mode? Unimplemented for now.
     */
    static run(context = "" /* May be removed */) {
        const config = this.loadUserConfig()
        if (!MysticalSorenUtilities.hasItems(config.cards)) {
            this.DEBUGGER.log("OpeningCards must be initialed!")
        }
        if (MysticalSorenUtilities.AIDungeon.getState("InnerSelf", { AC: { enabled: false } }).AC.enabled) {
            const queue = []
            const include_regex = new RegExp(`^${config.config.RegexLabel}: true$`, "gim")
            let innerSelfStoryCard = null // to be removed when MainSettings.InnerSelf is respected through scripting.
            storyCards.forEach(storyCard => {
                if (storyCard.entry.startsWith("{title: ")) {
                    return
                }
                if (storyCard.entry.match(include_regex)) {
                    queue.push(storyCard)
                    return
                }
                if (storyCard.title.match(/^Configure\s*Inner\s*Self\s*$/gim)) {
                    innerSelfStoryCard = storyCard
                }
                if (config.cards.includes(storyCard.id)) {
                    queue.push(storyCard)
                    return
                }
            })
            if (innerSelfStoryCard) {
                this.InnerSelfUtilities.addEntry(innerSelfStoryCard, config.innerSelfCharacters)
            }
            while (queue.length > 0) {
                const card = queue.shift()
                card.entry = card.entry.replace(include_regex, "")
                card.entry = card.entry.trim()
                const built = AutoCards().API.buildCard(card.title, card.entry, card.type, undefined, card.description, undefined)
                if (built) {
                    const erased = AutoCards().API.eraseCard((searchCard) => {
                        if (searchCard === card) {
                            return true
                        }
                        return false
                    }, false)
                    if (erased) {
                        AutoCards().API.setCardAsAuto(built, true)
                        if (innerSelfStoryCard) {
                            this.InnerSelfUtilities.addEntry(innerSelfStoryCard, this.InnerSelfUtilities.getFirstName(card))
                        }
                        continue
                    }
                }
                AutoCards().API.setCardAsAuto(card, true)
                if (innerSelfStoryCard) {
                    this.InnerSelfUtilities.addEntry(innerSelfStoryCard, this.InnerSelfUtilities.getFirstName(card))
                }
            }
        }
        /*
        switch (context.toLowerCase()) {
            case "input":
                break
            case "context":
                break
            case "output":
                break
            default:
                this.debug(`Unimplemented runContext: "${context}"`)
        }
        */
    }
    /**
     * Runs OpeningCards as well as InnerSelf.
     * @param {"input" | "context" | "output"} context
     */
    static runAsOne(context = "") {
        this.initialize()
        InnerSelf(context)
        this.run(context)
    }
}