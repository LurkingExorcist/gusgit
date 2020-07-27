const Trello = require("trello");

class TrelloWrapper extends Trello {
  constructor(config) {
    super(config.appkey, config.token);
    this.boardId = config.boardId;
  }

  getCard(cardId, callback) {
    return this.makeRequest('get', '/1/cards/' + cardId, {query: this.createQuery()}, callback);
  };

  async findCardByIdShort(idShort) {
    const cards = await this.getCardsOnBoard(this.boardId);

    return cards.find(card => card.idShort === idShort);
  }
}

module.exports = TrelloWrapper;