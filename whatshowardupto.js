const fetch = require('node-fetch');

//BillyPBot google custom search API key: AIzaSyDG50Hn9X5w-iXbBar_svLcjhh-C3sPC2s
//Google custom Search Engine: cx=006362324671217824133:izxqtrnyvk0

const howardUpdate = function(msg){
    
    console.log('in func');
    if(msg.content == '!WheresHoward?' || msg.content == '!whereshoward?' || msg.content == '!whereshowwie?' && !msg.author.bot){
        fetch('https://www.googleapis.com/customsearch/v1?key=AIzaSyDG50Hn9X5w-iXbBar_svLcjhh-C3sPC2s&cx=006362324671217824133:izxqtrnyvk0&q=howard+bruck+linkedin&num=1')
        .then(response => response.json())
        .then(data => {
            console.log('Successfully Queried Google');
            msg.reply('I thought I got rid of him! Where is he?\n' + data.items[0].title + '\n' + data.items[0].snippet + '\n' + data.items[0].link);
        });
    }
}

module.exports = { howardUpdate };

