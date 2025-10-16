/**
 * A requirement for the Homework 1 is to add your own mock data
 * to the users and playlists arrays.

 * DO NOT modify or edit the functions within this file in any way.

 * The funcations provide all the necessary logic to implement
 * the required API endpoints which should correctly interface
 * with this mock database.
 */
const User = {
    users: [
        {
            _id: 1,
            username: "yamini",
            password: "password123",
            registrationDate: "2025-10-07T20:35:26.902Z",
            playlists: [1,3]
            
            
        },
        {
            _id: 2,
            username: "mandadi",
            password: "password123",
            registrationDate: "2025-10-07T21:35:26.902Z",
            playlists: [2]
            
            
        }
    ],

    /**
     * Finds a single user by a given key/value pair.
     *
     * @param {string} key The property to search by ('_id', 'username')
     * @param {any} value The value to match against
     * @returns {object|undefined} The found user object or undefined if not found
     */
    find(key, value) {
        return this.users.find((user) => user[key] === value);
    },

    /**
     * Adds a new user to the mock mock database
     *
     * @param {object} user The user object to add, without an '_id'
     * @returns {object} The newly created user object with an '_id'
     */
    add(user) {
        const addUser = { ...user, _id: this.users.length + 1 };
        this.users.push(addUser);

        return addUser;
    }
};

const Playlist = {
    playlists: [
        {
            _id: 1,
            user_id: 1,
            title: "Workout Vibes",
            album: "Beats Reloaded",
            tracks: [
                {
                    track_id: 1,
                    track: "Power Up",
                    artist: "DJ Pulse",
                    album: "Beats Reloaded",
                    mbid: "2d23a03c-2e29-4c43-8c5c-63ac9e5566c4" // mock MusicBrainz ID
                },
                {
                    track_id: 2,
                    track: "Energy Flow",
                    artist: "Bassline Crew",
                    album: "Beats Reloaded",
                    mbid: "5a868b8f-d3df-4825-8f52-33fb47f3f5c1"
                }
            ]
        },
        {
            _id: 2,
            user_id: 2,
            title: "Chill Evenings",
            album: "Lo-Fi Dreams",
            tracks: [
                {
                    track_id: 1,
                    track: "Late Night Coffee",
                    artist: "Smooth Vibes",
                    album: "Lo-Fi Dreams",
                    mbid: "f0537b3e-8db5-4a0e-bd8a-8f8b5e0e5f5e"
                },
                {
                    track_id: 2,
                    track: "Rainy Window",
                    artist: "LoKey Beats",
                    album: "Lo-Fi Dreams",
                    mbid: "62a0b8e6-5e0c-4a0d-9c3a-3b8d5e5f5e5e"
                },
                {
                    track_id: 3,
                    track: "Cloud Thoughts",
                    artist: "Zen Soul",
                    album: "Lo-Fi Dreams",
                    mbid: "6b9a509f-6907-44f6-a8c9-9e5e3b5e5f5e"
                }
            ]
        },
        {
            _id: 3,
            user_id: 1,
            title: "Study Focus",
            album: "Concentration Beats",
            tracks: [
                {
                    track_id: 1,
                    track: "Deep Focus",
                    artist: "Study Music Project",
                    album: "Concentration Beats",
                    mbid: "c3f1e0c5-5e5e-4a5e-8c5e-5e5e5e5e5e5e"
                },
                {
                    track_id: 2,
                    track: "Brain Power",
                    artist: "Focus Flow",
                    album: "Concentration Beats",
                    mbid: "7e3b1f6c-e5e5-4a5e-8c5e-5e5e5e5e5e5e"
                },
                {
                    track_id: 3,
                    track: "Productivity Zone",
                    artist: "Mind Waves",
                    album: "Concentration Beats",
                    mbid: "8e3b1f6c-e5e5-4a5e-8c5e-5e5e5e5e5e5e"
                }
            ]
        }
    ],

    /**
     * Finds a single playlist by a given key/value pair
     *
     * @param {string} key The property to search by ('_id', 'user_id').
     * @param {any} value The value to match against
     * @returns {object|undefined} The found playlist object or undefined if not found
     */
    find(key, value) {
        return this.playlists.find((playlist) => playlist[key] === value);
    },

    /**
     * Finds a user and attaches an array of their associated playlists
     *
     * @param {number} userId The ID of the user to find
     * @returns {object} The user object with an added 'playlists' array
     */
    populate(userId) {
        const user = User.find('_id', userId);
        const playlists = this.playlists.filter((playlist) => playlist.user_id === userId);

        return { ...user, playlists };
    },

    /**
     * Add a new playlist to the mock database.
     * @param {object} data The playlist data to add ('title' and 'tracks')
     * @returns {object} The newly created playlist object with a generated '_id'
     */
    insert(data) {
        const _id = this.playlists.length + 1;
        const playlist = { _id, ...data };

        this.playlists.push(playlist);

        return playlist;
    },

    /**
     * Adds a track to a playlist's `tracks` array if a track with the same `mbid` doesn't already exist.
     * @param {number} id The '_id' of the playlist to update.
     * @param {object} track The track object to add.
     * @returns {object} The updated playlist object. Throws a TypeError if the playlist is not found.
     */
    addToSet(id, track) {
        
        const playlist = this.find('_id', id);


        const exists = playlist.tracks.some((g) => g.mbid === track.mbid);
        if (!exists) {
            playlist.tracks.push(track);
        }
        return playlist;
    },

    /**
     * Remove a playlist from the mock database.
     *
     * @param {number} id The '_id' of the playlist to remove
     * @returns {object} An object indicating the intended success of the operation and the targeted '_id'
     */
    delete(id) {
        this.playlists = this.playlists.filter((p) => p._id !== id);

        return { success: true, _id: id };
    }
};



export { User, Playlist };
