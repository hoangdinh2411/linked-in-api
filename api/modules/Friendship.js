const mongoose = require('mongoose')

const FriendshipSchema = new mongoose.Schema({
    

})


const FriendshipModel = mongoose.model('friendship',FriendshipSchema,'friendship')


module.exports = FriendshipModel