const populateChannels = function(client){
    var channels = {};
    // TODO: Resolve errors in this function
    var serverChannels = client.channels;
    console.log(serverChannels);
    // for(const channel of serverChannels.values()){
    //     channels[channel.name] = channel.id;
    //     console.log('Added channel ' + channel.name + ' with ID: ' + channel.id);
    // }
    return channels;
}

module.exports = { populateChannels };