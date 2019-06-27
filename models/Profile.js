const mongoose = require('mongoose');
// maybe the most important element of this schema is the list,
// this defines one of the purpose of this project, save list of your movies
// inside of this array of objects there is movies property that holds in an array
// the movies_ids that later i will use to query the API to get the data, in that 
// way i can display the movies that compose a list, that the best approach that i can come right know
const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    phrase: {
        type: String,
        required: true
    },
    lists: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            emotions: {
                type: [String],
                required: true
            },
            movies: {
                type: [String]
            }

        }]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);