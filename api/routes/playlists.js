import express from 'express';
import Playlist from '../models/playlist.js';

import {verifyUser} from '../middleware/authorization.js';
const router = express.Router();

router.use(verifyUser);

// const _sanitize=(userWithPlaylists)=>{
//     const playlistObj=userWithPlaylists.toObject?userWithPlaylists.toObject():userWithPlaylists;
//     const { password,user_id,username,registrationDate,createdAt,updatedAt,...rest }=playlistObj;
//     return rest;
// };

const _sanitize = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => {
            const playlistObj = item.toObject ? item.toObject() : item;
            const { password, username, registrationDate, createdAt, updatedAt, ...rest } = playlistObj;
            return rest;
        });
    }
    // ... rest of your original code
};

/**
 * @route GET /playlists
 * @description get playlists
 * @header {string} Authorization - "Bearer <token>"
 * @header {string} Authentication - unique id of the user
 * @returns {Object} 200 - playlists object
 */
router.get('/playlists', async (req, res) => {
    try {        
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ error: 'Authorization header not present' });
        }
        console.log('pl')
        //const playlists_user=Playlist.find(parseInt(userId))

        //const playlists_user=await Playlist.find({'user_id':userId}).populate('title');
        const playlists_user=await Playlist.find({'user_id':{$in:[userId]}}).populate('title');
        console.log(playlists_user)
        if(!playlists_user){
            return res.status(400).json({ error: 'Playlist Not found' });
        }
        return res.status(200).json({"playlists":_sanitize(playlists_user)});
    }catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get playlist' });
    }
});

/**
 * @route POST /playlists
 * @description create playlists
 * @header {string} Authorization - "Bearer <token>"
 * @header {string} Authentication id of the user
 * @returns {Object} 200 - playlists object
 */
router.post('/playlists', async (req, res) => {
    try {
        
        const userId = req.user._id;
        const {title}=req.body;
        // if (!userId) { Not required
        //     return res.status(401).json({ error: 'authentication header not present' });
        // }
        if(!title){
            return res.status(400).json({ error: 'title is required' });
        }
        // const existing_title=Playlist.playlists.filter(
        //     eachPlaylist => (eachPlaylist.user_id===parseInt(userId) && eachPlaylist.title===title) 
        // );
        const existing_title = await Playlist.findOne({"user_id":userId,"title":title});
        console.log(existing_title)

        if(existing_title){
            return res.status(409).json({ error: 'Title already exists' });//title exists for that user or not
        }

        const new_playlist= new Playlist({
            user_id: userId,
            title: title,
            tracks:[]
        });
       
        await Playlist.create(new_playlist)
        console.log('yes')
        return res.status(201).json(new_playlist);
        

    }catch (err){
        console.log(err);
        res.status(500).json({ error: 'Failed to add playlist' });
    }
});

/**
 * @route PUT /playlists/:id
 * @description update playlists by adding track
 * @header {string} Authorization - "Bearer <token>"
 * @param {number} playlist id to update
 * @body {Object} track- the full track object to add to the playlist
 * @returns {Object} 200 - playlists object, updated with the tracks
 */

router.put('/playlists/:playlist_id', async (req, res) => {
    try{
        const user = req.user;
        const {playlist_id}=req.params; 
        //console.log(req.body)       
        const { trackdata }=req.body;
       // console.log(trackdata)
        if(!trackdata){
            return res.status(400).json({ error: 'track data  is required' });
        }

        if (!trackdata.track || !trackdata.artist || !trackdata.album || !trackdata.mbid) {
            return res.status(400).json({ error: 'Track data must include: track, artist, album, mbid' });
        }

        const existing_playlist=await Playlist.findOne({ _id:{$in:[playlist_id]},
                                                         user_id:{$in:[user._id]}                                                       
        });
        console.log(existing_playlist)
        if(!existing_playlist){
            return res.status(404).json({ error: 'Given playlist not found for user' });    
        } 
        
        const existing_track = existing_playlist.tracks.find(
            t => t.track === trackdata.track
        );
        
        if (existing_track) {
            return res.status(409).json({ 
                error: 'This track with this name already exists' 
            });
        }

        // Check if track with same mbid already exists in this playlist
        const existing_mbid = existing_playlist.tracks.find(
            track => track.mbid === trackdata.mbid
        );
        
        if (existing_mbid) {
            return res.status(409).json({ 
                error: 'This track with this mbid already exists in this playlist' 
            });
        }
        
        const updated_playlist = await Playlist.findByIdAndUpdate(
            playlist_id,
            { $addToSet: { tracks: trackdata } },
            { new: true } // Return the updated document
        );
        return res.status(200).json(updated_playlist);        
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update playlist with track data' });
    }
});

/**
 * @route DELETE /playlists/:id
 * @description Deletes a specific playlist owned by the user
 * @header {string} Authorization - "Bearer <token>"
 * @header {string} Authentication id of the user
 * @param {number} playlist id to delete
 * @returns {Object} 200 - a confirmation object {success:true,_id:<id>}
 */
router.delete('/playlists/:playlist_id', async (req, res) => {
    try{
        const userId = req.user._id;
        const {playlist_id}=req.params;
  
        const existing_playlist = await Playlist.findOne({
            _id: { $in: [playlist_id] },
            user_id: { $in: [userId] }
        });

        if(!existing_playlist){
            return res.status(404).json({ error: 'playlist not found' });    
        }
        existing_playlist.$locals.userId=userId;
        existing_playlist.$locals.playlistId=playlist_id;
        await existing_playlist.deleteOne();

        return res.json({ message: {success:true, _id: playlist_id }});
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});


export default router
