import express from 'express';
import { Playlist } from '../db/mock_db.js';
import {verifyUser} from '../middleware/authorization.js';
const router = express.Router();

router.use(verifyUser);

const _sanitize=(userWithPlaylists)=>{
    const { password,_id,username,registrationDate,...rest }=userWithPlaylists;
    return rest;
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
        console.log(req.headers)
        const userId = req.headers.id;//check if it can pass in a header or not

        if (!userId) {
            return res.status(401).json({ error: 'Authorization header not present' });
        }

        const playlists_user=Playlist.populate(parseInt(userId));
        return res.status(200).json(_sanitize(playlists_user));
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
        
        const userId = req.headers.id;
        const {title, album}=req.body;
        if (!userId) {
            return res.status(401).json({ error: 'authentication header not present' });
        }
        if(!title){
            return res.status(400).json({ error: 'title is required' });
        }
        const existing_title=Playlist.playlists.filter(
            eachPlaylist => (eachPlaylist.user_id===parseInt(userId) && eachPlaylist.title===title) 
        );
        if(existing_title.length>0){
            return res.status(409).json({ error: 'Title already exists' });//title exists for that user or not
        }

        const new_Id=Playlist.playlists.length+1
        const playlistData={
            _id: new_Id,
            user_id: parseInt(userId),
            title: title,
            album: album || '',//optional field
            tracks: []
        };
        
        
        const newPlaylist=Playlist.insert(playlistData);

        return res.status(201).json(newPlaylist);
        

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
        const userId = req.headers.id;
        const {playlist_id}=req.params;
        
        const { trackdata }=req.body;
        if (!userId) {
            return res.status(401).json({ error: 'authentication header not present' });
        }

        if(!trackdata){
            return res.status(400).json({ error: 'track data  is required' });
        }
        if (!trackdata.track || !trackdata.artist || !trackdata.album || !trackdata.mbid) {
            return res.status(400).json({ error: 'Track data must include: track, artist, album, mbid' });
        }
        
        const existing_playlist=Playlist.find('_id',parseInt(playlist_id));
        if(!existing_playlist){
            return res.status(404).json({ error: 'Given playlist not found for user' });    
        }

        if (existing_playlist.user_id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Unauthorized access to playlist' });
        }

        const existing_mbid=existing_playlist.tracks.find(eachTrack=> eachTrack.mbid==trackdata.mbid)
        if(existing_mbid){
            return res.status(409).json({error:'This track already exists for the user in the playlist'})

        }

        const trackToBeAdded={track_id:existing_playlist.tracks.length+1,...trackdata}

        const playlist=Playlist.addToSet(parseInt(playlist_id),trackToBeAdded)

        return res.status(200).json(playlist);
        
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
        const userId = req.headers.id;
        const {playlist_id}=req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Authorization header not present' });
        }
  
        const existing_playlist=Playlist.find('_id',parseInt(playlist_id)) && Playlist.find('user_id',parseInt(userId));
        if(!existing_playlist){
            return res.status(404).json({ error: 'playlist not found' });    
        }

        const outputMessage=Playlist.delete(parseInt(playlist_id))

        return res.json({ message: outputMessage });
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});


export default router
