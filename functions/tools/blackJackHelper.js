const axios = require('axios');

const API_URL = 'https://deckofcardsapi.com/api/deck';

const SUITS = {
    'HEARTS' : ' ♥️',
    'DIAMONDS' : ' ♦️',
    'CLUBS' : ' ♣️',
    'SPADES' : ' ♠️'
};

module.exports = (client) => {
    client.createNewDeck = async () => {
        const deckData = (await axios.get(`${API_URL}/new/draw/?count=4`)).data;
        if (!deckData || !deckData.success) {
            throw new Error('Failed to create new deck');
        }
        return deckData;
    }

    client.extractCardValue = (card) => {
        return `${isNaN(card.value) ? card.value[0] : card.value}${SUITS[card.suit]}`;
    }

    client.formatCards = (arrOfCards, hide = false) => {
        let cards = [...arrOfCards]
        if (hide) {
            cards = cards.map((card, index) => index === 0 ? card : '??');
        }
        return "```" + cards.join('    ') + "```";
    }

    client.drawNewCard = async (deck) => {
        const deckData = (await axios.get(`${API_URL}/${deck}/draw/?count=1`)).data;
        if (!deckData || !deckData.success) {
            throw new Error('Failed to draw new card');
        }
        return client.extractCardValue(deckData.cards[0]);
    }

    client.getBestHandValue = (cards) => {
        let value = 0;
        let aceCount = 0;

        for (const card of cards) {
            const cardValue = card.split(" ")[0];

            if (isNaN(cardValue)) {
                if (cardValue === 'A') {
                    aceCount++;
                    value += 11;
                } else {
                    value += 10;
                }
            } else {
                value += +cardValue;
            }
        }

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    };

    client.isBust = (cards) => {
        const value = client.getBestHandValue(cards);
        return value > 21;
    }

    client.isBlackJack = (cards) => {
        const value = client.getBestHandValue(cards);
        return value === 21;
    }

    client.isDealerStay = (cards) => {
        const value = client.getBestHandValue(cards);
        return value >= 17;
    }

    client.isPlayerWin = (playerHand, dealerHand) => {
        const playerValue = client.getBestHandValue(playerHand);
        const dealerValue = client.getBestHandValue(dealerHand);
        return playerValue > dealerValue;
    }

    client.isDraw = (playerHand, dealerHand) => {
        const playerValue = client.getBestHandValue(playerHand);
        const dealerValue = client.getBestHandValue(dealerHand);
        return playerValue === dealerValue;
    }
}