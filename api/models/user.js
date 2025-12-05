import mongoose from 'mongoose';
/*
user schema

*/
const UserSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:[true,'username is required'],
            unique:true,
            lowercase:true
        },
        password:{
            type:String,
            required:[true,'password is required']
        },
        registrationDate:{//check this field
            type: String,
            default: () => new Date().toISOString(),
            immutable: true
        }
    },
    {
        timestamps: true,//will add atCreated & updatedat fields
        versionKey: false
    }
);

//virtuals
UserSchema.virtual('playlist',{
    ref:'Playlist',//reerence to the model
    localField:'_id',//id of user
    foreignField:'user_id'
})

UserSchema.set('toObject',{virtuals:true});
UserSchema.set('toJSON',{virtuals:true});

const User=mongoose.model('User',UserSchema);

export default User;






