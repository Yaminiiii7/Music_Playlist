import axios from 'axios';
import express from 'express';

const router=express.Router();

const LASTFM_API_KEY=process.env.API_KEY;
const LASTFM_BASE_URL='http://ws.audioscrobbler.com/2.0/';

router.get('/search',async(req,res)=>{
    const {track,fuzzy}=req.query;

    //optional to check authorization
    if(!track || track.trim()===''){
        return res.status(400).json({ error: 'track parameter required' });
    }
    try{
        const params={
            method: 'track.search',
            api_key: LASTFM_API_KEY,
            track,
            format: 'json'
        };

        const useFuzzy = fuzzy === 'true';
        
        const {data}=await axios.get(`${LASTFM_BASE_URL}`,{params});
        let minimal = data.results.trackmatches.track
                        .filter(_track => _track.mbid && _track.mbid.trim() !== '')
                        .map((_track) => {
                            return {
                
                                        name: _track.name,
                                        artist: _track.artist,
                                        mbid: _track.mbid,
                                        url: _track.url
                            };
                        });
        //strict match
        if(!useFuzzy){
            const searchTerm=track.toLowerCase();
            minimal=minimal.filter(_track=> _track.name.toLowerCase().includes(searchTerm));
        }
        res.json(minimal);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'failed to search'});
    };
});

router.get('/:mbid',async(req,res)=>{
    const {mbid}=req.params;
    
    if(!mbid||mbid.trim() === ''){
        return res.status(400).json({ error: 'mbid required' });
       
    }
    try{
        const params={
            api_key: LASTFM_API_KEY,
            method: 'track.getInfo',
            mbid,
            format: 'json'
        }
        
        const {data} =await axios.get(`${LASTFM_BASE_URL}`,{params});
        const minimal = {
            //id: data.id,
            name: data.track.name,
            mbid: data.track.mbid,
            url: data.track.url,
            album: data.track.album.title,
            artist_name: data.track.artist.name,
            published: data.track.wiki.published,
            toptags: data.track.toptags.tag.map((t) => t.name)
            
        };
        res.status(200).json(minimal);
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get track by mbid via Last.fm API' });

    }
});

export default router;