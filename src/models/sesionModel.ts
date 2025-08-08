import  mongoose from "mongoose";

export interface SessionDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true
});

const Session = mongoose.model<SessionDocument>("Session", sessionSchema);
export default Session;