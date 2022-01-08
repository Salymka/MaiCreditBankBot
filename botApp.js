const TelegramBot = require('node-telegram-bot-api');
const {API_Token, DB_URL} = require("./config");
const mongoose = require("mongoose");
const User = require('./models/bankUser')
const GroupSpin = require('./models/groupSpin')

const commandsDescription = `/help - help info of commands
/my_money - score of maiCredits
/send_credits - send maiCredits to another user like < command value @user >
/free_credits - free maiCredits for people in group once a day`


const bot = new TelegramBot(API_Token, {polling: true});


const start = async () => {
    await bot.setMyCommands([
        {command: 'help', description: 'Help info'},
        {command: 'my_money', description: 'Your balance'},
        {command: 'send_credits', description: 'send maiCredits'},
        {command: 'free_credits', description: 'free maiCredits once a day'},
    ])
    try {
        await mongoose.connect(
            DB_URL,
            {useNewUrlParser: true, useUnifiedTopology: true},
            () => console.log(" Mongoose is connected")
        );
    } catch (e) {
        console.log(e);
    }


    bot.onText(/\/send_credits (.+) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const personId = msg.from.id
        const personName = msg.from.username
        const credits = +match[1]
        const luckyManName = match[2].substr(1)
        console.log(credits);
        console.log(luckyManName);
        try {
            const user = await User.findOne({userId:personId})
            if(!user){
                return await bot.sendMessage(chatId, `@${personName}, Великий Май не співпрацює з тобою!`);
            }
            const luckyMan = await User.findOne({userName: luckyManName})
            if (!luckyMan) {
                return await bot.sendMessage(chatId, `Май не працює з цим ніщебродом : ${luckyManName}.`);
            }

            const person = await User.findOne({userId: personId})

            if (person.credits >= credits) {
                person.credits -= credits;
                person.save((e) => console.log(e));
            } else {
                return await bot.sendMessage(chatId, `@${personName}, в тебе нехватає maiCredits, Бездар!`);
            }
            luckyMan.credits += credits;
            luckyMan.save((e) => console.log(e));
            return await bot.sendMessage(chatId, `Май перевів ${credits} maiCredits від @${personName} до рахунку @${luckyManName}.`);
        } catch (e) {
            console.log(e);
        }
    })

    bot.onText(/\/help/, async (msg, match) => {
        const chatId = msg.chat.id;
        try {
            return await bot.sendMessage(chatId, commandsDescription);
        } catch (e) {
            console.log(e);
        }
    })

    bot.onText(/\/my_money/, async (msg, match) => {
        const chatId = msg.chat.id;
        const personId = msg.from.id
        const personName = msg.from.username
        const chatType = msg.chat.type
        try {
            const user = await User.findOne({userId: personId})

            if (user) {
                await bot.sendMessage(chatId, `@${personName}, у твоїй кишені ${user.credits} maiCredits`);

                const inGroup = await GroupSpin.findOne({groupId: chatId})


                if (!inGroup && chatType.includes("group")) {
                    const newGroup = await new GroupSpin({groupId: chatId})
                    await newGroup.save((e) => console.log(e))
                }
                if (inGroup && !(inGroup.groupUsers.includes(personId.toString()))) {
                    inGroup.groupUsers.push(personId)
                    return await inGroup.save((e) => console.log(e))
                }
            } else {
                const newUser = await new User({
                    userId: personId,
                    userName: personName,
                })
                await newUser.save((e) => console.log(e))
                const group = await GroupSpin.findOne({groupId: chatId})
                if (!group && chatType.includes("group")) {
                    const newGroup = await new GroupSpin({groupId: chatId})
                    await newGroup.save((e) => console.log(e))
                } else if(group) {
                    group.groupUsers.push(personId)
                    await group.save((e) => console.log(e))
                }

                return await bot.sendMessage(chatId, `@${personName}, Май Великий нефритовий стержень вітає тебе у своїй сім'ї`);

            }
        } catch (e) {
            console.log(e);
        }
    })

    bot.onText(/\/free_credits/, async (msg, match) => {
        const chatId = msg.chat.id;
        try {
            const group = await GroupSpin.findOne({groupId: chatId})
            if ( group && group.groupUsers.length === 0) {
                return await bot.sendMessage(chatId, `Ти шо дурний? Група пуста, Май так не грає!`);
            }
            if (group) {
                if ((Date.now() - group.lastSpin) / 60000 > 24 * 60) {
                    group.lastSpin = Date.now()
                    const winner = Math.floor(Math.random() * group.groupUsers.length + 1) - 1
                    const prise = Math.floor(Math.random() * 51)
                    const winPerson = await User.findOne({userId: +group.groupUsers[winner]})
                    winPerson.credits += prise;
                    await winPerson.save((e) => console.log(e))
                    return await bot.sendMessage(chatId, `@${winPerson.userName}, Май вітає тебе з виграшом ${prise} maiCredits`);

                } else {
                    return await bot.sendMessage(chatId, `Соси бібу, ще рано получати maiCredits`);
                }

            } else {
                if (msg.chat.type === "group") {
                    const newGroup = await new GroupSpin({groupId: chatId})
                    await newGroup.save((e) => console.log(e))
                } else {
                    return await bot.sendMessage(chatId, `Хітрожопий? Це не група, це лс.`);
                }
                return await bot.sendMessage(chatId, `Май створив розіграш для цієї групи, тепер виможете грати`);
            }
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

        } catch (e) {
            console.log(e)
        }
    })

}

start()
