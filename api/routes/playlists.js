import express from 'express';
import { User,Playlist } from '../db/mock_db.js';
const router = express.Router();

const _sanitize=(userWithPlaylists)=>{
    const { password,_id,username,registrationDate,...rest }=userWithPlaylists;
    return rest;
};


router.get('/playlists', async (req, res) => {
    try {
        
        const userId = req.headers.authentication;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const existing_user=User.find('_id',parseInt(userId));
        if(!existing_user){
            return res.status(404).json({ error: 'No user exists' });
        }
        const playlists_user=Playlist.populate(parseInt(userId));
        return res.status(200).json(_sanitize(playlists_user));
    }catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get playlist' });
    }
});



router.post('/playlists', async (req, res) => {
    try {
        
        const userId = req.headers.authentication;
        const {title, album}=req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if(!title){
            return res.status(400).json({ error: 'title is required' });

        }

        const existing_user=User.find('_id',parseInt(userId));
        if(!existing_user){
            return res.status(404).json({ error: 'No user exists' });
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
        
        existing_user.playlists.push(new_Id)//updating userdata
        const newPlaylist=Playlist.insert(playlistData);

        return res.status(201).json(newPlaylist);
        

    }catch (err){
        console.log(err);
        res.status(500).json({ error: 'Failed to add playlist' });
    }
});

router.put('/playlists/:playlist_id', async (req, res) => {
    try{
        const userId = req.headers.authentication;
        const {playlist_id}=req.params;
        
        const { trackdata }=req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const existing_user=User.find('_id',parseInt(userId));
        if(!existing_user){
            return res.status(404).json({ error: 'No user exists' });
        }
        if(!trackdata){
            return res.status(400).json({ error: 'track data  is required' });
        }
        if (!trackdata.track || !trackdata.artist || !trackdata.album || !trackdata.mbid) {
            return res.status(400).json({ error: 'Track data must include: track, artist, album, mbid' });
        }
        
        const existing_playlist=Playlist.find('_id',parseInt(playlist_id));
        if(!existing_playlist){
            return res.status(404).json({ error: 'Given playlist not  found for user' });    
        }

        if (existing_playlist.user_id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Unauthorized access to playlist' });
        }

        const existing_mbid=existing_playlist.tracks.find(eachTrack=> eachTrack.mbid==trackdata.mbid)
        if(existing_mbid){
            return res.status(409).json({error:'This track already exists for the user in the playlist'})

        }//
    

        const trackToBeAdded={track_id:existing_playlist.tracks.length+1,...trackdata}

        const playlist=Playlist.addToSet(parseInt(playlist_id),trackToBeAdded)

        return res.status(200).json(playlist);
        
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update playlist with track data' });

    }
});


router.delete('/playlists/:playlist_id', async (req, res) => {
    try{
        const userId = req.headers.authentication;
        const {playlist_id}=req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const existing_user=User.find('_id',parseInt(userId));
        if(!existing_user){
            return res.status(404).json({ error: 'No user exists' });
        }

        const existing_playlist=Playlist.find('_id',parseInt(playlist_id)) && Playlist.find('user_id',parseInt(userId));
        if(!existing_playlist){
            return res.status(404).json({ error: 'playlist not found' });    
        }

        const outputMessage=Playlist.delete(parseInt(playlist_id))

        existing_user.playlists = existing_user.playlists.filter(id => id !== parseInt(playlist_id));//update user data
        

        return res.json({ message: outputMessage });
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to delete playlist' });

    }
});


export default router
