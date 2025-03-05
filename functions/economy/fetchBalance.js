const Balance = require('../../schemas/balance');
const { Types } = require('mongoose');

module.exports = (client) => {
    client.fetchBalance = async (userId, guildId) => {
        let storedBalance = await Balance.findOne({
            userID: userId,
            guildID: guildId,
        });
        if (!storedBalance) {
            storedBalance = await new Balance({
                _id: new Types.ObjectId(),
                userID: userId,
                guildID: guildId,
            });
            await storedBalance
                .save()
                .then(async (balance) => {
                    console.log(`New balance created for ${userId} in ${guildId}`
                    );
                }).catch(console.error);
            return storedBalance;
        } else return storedBalance;
    };
};