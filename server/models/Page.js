import mongoose from 'mongoose';

// define schema
const pageSchema = new mongoose.Schema({
    pageNumber: {
        type: Number,
        required: true,
    },

    content: {
        type: String,
        default: "",
    },

    bookmarked: {
        type: Boolean,
        default: false,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


// turn schema into mongoose model
const Page = mongoose.model("Page", pageSchema);

export default Page;