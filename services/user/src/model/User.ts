import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    bio: string;
}

const schema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v: string) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: "Invalid email format",
            },
        },
        image: {
            type: String,
            // required: true,
        },
        instagram: {
            type: String,
        },
        facebook: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        bio: {
            type: String,
            // required: true,
            maxlength: 250,
        },
    },
    {
        timestamps: true, 
    }
);

const User = mongoose.model<IUser>("User", schema);

export default User;
