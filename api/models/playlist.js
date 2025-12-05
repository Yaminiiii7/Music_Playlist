import mongoose from 'mongoose';

/*
tracks-subdocument schema
*/
const TrackSchema=new mongoose.Schema(
    {        
        track: {
            type:String,
            required:[true, 'track is required'],
            //unique: true
        },
        artist:{
            type:String,
            required:[true, 'artist is required']

        },
        album:{
            type:String,
            required:[true, 'album is required']
        },
        mbid:{
            type: String,
            required: [true,'mbid is required'],
            
        },
        image:{
            type: String,
            default:''

        }        
    },
    { 
        _id: false,
        versionKey: false
    
     }

)


/*
playlist schema
*/
const PlaylistSchema=new mongoose.Schema(
    {
        user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title:{
            type: String,
            required: true,
            unique: true
        },
        tracks: {
            type: [TrackSchema],
            default:[]
        }        
    },
    {
        timestamps: true,//will add atCreated & updated at fields
        versionKey: false
    }
);



// Pre-delete hook - runs before deletion to delete tracks
PlaylistSchema.pre('deleteOne', { document: true}, async function() {
    const userId = this.$locals.userId;
    const playlist_ID =this.$locals.playlistId;
    
    console.log(`User ${userId} deleting playlist: ${this.title} (${this._id})`);
    console.log(`Tracks being removed: ${this.tracks.length}`);
    await Playlist.findByIdAndUpdate(//not necessary but still deleting tracks before playlist gets deleted.
    playlist_ID,
    { $set: { tracks: [] } },
    );
});






const Playlist=mongoose.model('Playlist',PlaylistSchema);

//const playlist=await Playlist.findOne({_id:playlistId}).populate('user_id');
export default Playlist;