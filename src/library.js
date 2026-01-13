class SorenOpeningCards {
    static NAMESPACE = "SorenOpeningCards"
    static EXCLUDE_PATTERN = "#AC_EXCLUDE"
    static debug(msg) {
        log(`${this.NAMESPACE}: ${msg}`)
    }
    static getConfig() {
        return MysticalSorenUtilities.getState(this.NAMESPACE, {
            cards: [],
            configId: -1,
            config: {
                RegexLabel: "AutoCards?"
            }
        })
    }
    static loadUserConfig() {
        const config = this.getConfig()
        const createConfigCard = () => {
            const card = MysticalSorenUtilities.addStoryCard(`${this.NAMESPACE} Configuration`, JSON.stringify(config.config, (_, value) => {
                return value
            }, 1), "", "Configuration", "")
            config.configId = Number(card.id)
            MysticalSorenUtilities.setState(this.NAMESPACE, config)
            return card
        }
        if (config.configId === undefined || config.configId < 0) {
            createConfigCard()
            return config
        }
        const idx = MysticalSorenUtilities.getStoryCardIndexById(config.configId)
        if (idx < 0) {
            createConfigCard()
            return config
        }
        const card = storyCards[idx]
        try {
            config.config = JSON.parse(card.entry)
            MysticalSorenUtilities.setState(this.NAMESPACE, config)
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
            config.cards.push(storyCard.id)
        })
        MysticalSorenUtilities.setState(this.NAMESPACE, config)
    }
    static run(context = "") {
        const config = this.loadUserConfig()
        if (!MysticalSorenUtilities.hasItems(config.cards)) {
            this.debug("OpeningCards must be initialed!")
        }
        if (MysticalSorenUtilities.getState("AutoCards", { config: { doAC: false } }).config.doAC) {
            const queue = []
            const include_regex = new RegExp(`^${config.config.RegexLabel}: true$`, "gim")
            storyCards.forEach(storyCard => {
                if (storyCard.entry.startsWith("{title: ")) {
                    return
                }
                if (storyCard.entry.match(include_regex)) {
                    queue.push(storyCard)
                    return
                }
                if (config.cards.includes(storyCard.id)) {
                    queue.push(storyCard)
                    return
                }
            })
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
        AutoCards(context, text, false)
        this.run(context)
    }
}