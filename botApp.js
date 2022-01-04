const TelegramBot = require('node-telegram-bot-api');
const {API_Token, DB_URL} = require("./config");
const mongoose = require("mongoose");
const User = require('./models/bankUser')
const GroupSpin = require('./models/groupSpin')
const commandsDescription = "Commands\n MyMoney - score of maiCredits\n sendCredits  < value >  < @userName >  -  send maiCredits\n FreeMaiCreditsSpin - free maiCredits for people in chat"
const bot = new TelegramBot(API_Token, {polling: true});

const start = async () => {
    try {
        await mongoose.connect(
            DB_URL,
            {useNewUrlParser: true, useUnifiedTopology: true},
            () => console.log(" Mongoose is connected")
        );
    } catch (e) {
        console.log(e);
    }
    bot.onText(/\/sendCredits (.+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const personId = msg.from.id
        const personName = msg.from.username
        const credits = +match[1]
        const luckyManName = match[2].substr(1)
        try {
            const luckyMan = await findName(luckyManName)
            if (!luckyMan) {
                return await bot.sendMessage(chatId, ` MaiCreditBank doesn't cooperate with ${luckyManName}.`);
            }

            const person = await findId(personId)

            if (person.maiCredits >= credits) {
                person.maiCredits -= credits;
                person.save((e) => console.log(e));
            } else {
                return await bot.sendMessage(chatId, `${personName}, not enough maiCredits, You are BEZDAR!`);
            }
            luckyMan.maiCredits += credits;
            luckyMan.save((e) => console.log(e));
            return await bot.sendMessage(chatId, ` MaiCreditBank passed ${credits} maiCredits to ${luckyManName}.`);
        } catch (e) {
            console.log(e);
        }
    })
    bot.on('message', async msg => {
        try {
            const chatId = +msg.chat.id;
            const message = msg.text
            const personId = +msg.from.id
            const personName = msg.from.username


            if (message === '/MyMoney') {
                const user = await findId(personId)
                if (user) {

                    return await bot.sendMessage(chatId, `${personName}, Your balance is ${user.maiCredits} maiCredits`);

                } else {
                    const newUser = await new User({
                        idUser: personId,
                        name: personName,
                    })
                    newUser.save((e) => console.log(e))
                    if (msg.chat.type === "group") {
                        const newGroup = await new GroupSpin({idGroup: chatId})
                        await newGroup.save((e) => console.log(e))
                    }

                    return await bot.sendMessage(chatId, `Now ${personName}, You in MaiCreditBank system. On your's card 350 maiCredits`);

                }
            }


            if (message === '/FreeMaiCreditsSpin') {

                const group = await findGroup(chatId);

                if (group) {
                    if (!personId in group.groupUsers) {
                        return await bot.sendMessage(chatId, `Please Init person in Group`);
                    }
                    if ((Date.now() - group.lastSpin) / 60000 > 24 * 60) {
                        group.lastSpin = Date.now()
                        const winner = Math.floor(Math.random() * group.groupUsers.length + 1) - 1
                        const prise = Math.floor(Math.random() * 51)
                        const winPerson = await findId(+group.groupUsers[winner])
                        winPerson.maiCredits += prise;
                        await winPerson.save((e) => console.log(e))

                    } else {
                        return await bot.sendMessage(chatId, `Not Yet`);
                    }

                } else {
                    if (msg.chat.type === "group") {
                        const newGroup = await new GroupSpin({idGroup: chatId})
                        await newGroup.save((e) => console.log(e))
                    } else {
                        return await bot.sendMessage(chatId, `Its not Group`);
                    }
                    return await bot.sendMessage(chatId, `Initialization this group done, now you can play`);
                }

            }

            if (message === '/InitPersonInGroup') {
                const group = await findGroup(chatId)
                if (!(personId in group.groupUsers)) {
                    group.groupUsers.push(personId)
                    await group.save((e) => console.log(e))
                    return await bot.sendMessage(chatId, `Init person in Group successful.`);
                } else {
                    return await bot.sendMessage(chatId, `You already init in  this group`);
                }
            }

            if (message === '/Commands') {
                return await bot.sendMessage(chatId, commandsDescription);
            }

        } catch (e) {
            console.log(e)
        }
    })

}


function findId(id) {
    return User.findOne({idUser: id})
}

function findName(name) {
    return User.findOne({name: name})
}

function findGroup(id) {
    return GroupSpin.findOne({idGroup: id})
}

start()
