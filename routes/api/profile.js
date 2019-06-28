const express = require("express");
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check');
// @route     GET api/profile/me
// @desc      Get users profile
// @access    Private
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route     POST api/profile
// @desc      Create or Update users profile
// @access    Private
router.post('/', [auth, [
    check('phrase', 'Phrase is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // I get this from the user input and apply this destructure
        const { phrase } = req.body;
        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (phrase) profileFields.phrase = phrase;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }
            // Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route     GET api/profile
// @desc      Get all profile
// @access    Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});


// @route     GET api/profile/user/:user_id
// @desc      Get profile by user Id
// @access    Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error')
    }
});

// @route     DELETE api/profile
// @desc      Delete profile, user & posts
// @access    Private
router.delete('/', auth, async (req, res) => {
    try {

        // this removes the profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

// @route     PUT api/profile/lists
// @desc      Add list to profile
// @access    Private
router.put('/lists', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('emotions', 'Emotion is required').not().isEmpty()]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        description,
        emotion,
        movies
    } = req.body;

    const newList = {
        title,
        description,
        emotion,
        movies
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        console.log(profile);
        profile.lists.unshift(newList);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route     DELETE api/profile/lists/:list_id
// @desc      Delete list from profile
// @access    Private
router.delete('/lists/:list_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // Get remove index 
        const removeIndex = profile.lists.map(item => item.id).indexOf(req.params.lists_id);
        // Remove 
        profile.lists.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

// @route     GET api/profile/lists/:list_id
// @desc      Get movies from list 
// @access    Public
router.get('/profile/lists/:list_id', async (req, res) => {
    try {
        const movies = await lists.movies.map(elem => elem);
        const moviesRequest = {

            uri: `https://api.themoviedb.org/3/search/movie?api_key=${config.get('movieSecret')}&query=${movies}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(moviesRequest, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No  movies' });
            }

            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
module.exports = router;
