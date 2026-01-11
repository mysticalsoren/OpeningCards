function modifier() {
    SorenOpeningCards.initialize()
    AutoCards("input", text, false)
    SorenOpeningCards.run()
    return { text: text, stop: false }
}
modifier();