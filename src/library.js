class SorenOpeningCards {
    static get DEBUGGER() {
        return MysticalSorenUtilities.Debugger(this.name)
    }
    static EXCLUDE_PATTERN = "#AC_EXCLUDE"
    static getConfig() {
        return MysticalSorenUtilities.AIDungeon.getState(this.name, {
            cards: [],
            configId: -1,
            config: {
                RegexLabel: "AutoCards?"
            },
            innerSelfCharacters: (typeof MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS == "string") ? MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS : ""
        })
    }
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
            let space = storyCard.title.indexOf(' ')
            space = space > -1 ? space : storyCard.title.length
            config.innerSelfCharacters += `${storyCard.title.substring(0, space)},`
        })
        if (config.innerSelfCharacters.endsWith(',')) {
            config.innerSelfCharacters = config.innerSelfCharacters
                .substring(0, config.innerSelfCharacters.length - 1)
        }
        MainSettings.InnerSelf.IMPORTANT_SCENARIO_CHARACTERS = config.innerSelfCharacters
        MysticalSorenUtilities.AIDungeon.setState(this.name, config)
    }
    static run(context = "") {
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
                const t0 = /^>\s*Write.*priority:$/im
                const match = t0.exec(innerSelfStoryCard.description)
                if (match) {
                    const characters = innerSelfStoryCard.description.substring(t0.lastIndex).trim().replace(/\n/g, ',')
                    if (characters !== config.innerSelfCharacters) {
                        config.innerSelfCharacters.split(',').forEach((IS_character) => {
                            if (!characters.includes(IS_character)) {
                                if (innerSelfStoryCard.description.endsWith('\n')) {
                                    innerSelfStoryCard.description += `${IS_character}\n`
                                    return
                                }
                                innerSelfStoryCard.description += `\n${IS_character}`
                            }
                        })
                    }
                }

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
                        continue
                    }
                }
                AutoCards().API.setCardAsAuto(card, true)
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
    static runAsOne(context = "") {
        this.initialize()
        InnerSelf(context)
        this.run(context)
    }
}