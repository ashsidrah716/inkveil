import express from 'express';
import Page from "../models/Page.js";

const router = express.Router();

// Read - get all pages
router.get("/", async (req, res) => {
    try {
        const pages = await Page.find();

        res.json(pages);
    } catch {
        res.status(500).json({ message: "Failed to fetch pages" });
    }
});

// Create - create a new page spread
router.post("/", async (req, res) => {
    try {
        const createdPages = await Page.insertMany(req.body.pages);

        res.status(201).json(createdPages);
    } catch {
        res.status(500).json({ message: "Failed to create pages" });
    }
});

// Upadate - update pages
router.put("/", async (req, res) => {
    try {
        const updatedPages = [];

        for (const page of req.body.pages) {
            const updatedPage = await Page.findByIdAndUpdate(
                page._id,
                {
                    pageNumber: page.pageNumber,
                    content: page.content,
                    bookmarked: page.bookmarked,
                    updatedAt: new Date()
                },
                { new: true }   // ← back to this, not { returnDocument: "after" }
            );

            updatedPages.push(updatedPage);
        }

        res.json(updatedPages);
    } catch {
        res.status(500).json({ message: "Failed to update pages" });
    }
});

// Delete - delete a page
router.delete("/", async (req, res) => {
    try {
        const pages = await Page.find()
            .sort({ pageNumber: -1 })  // sort in descending order
            .limit(2);  // give me top 2 pages

        if (pages.length < 2) {
            return res.status(400).json({
                message: "There is no complete spread to delete"
            });
        }

        // get ids of top 2 pages
        const pageIds = pages.map(page => page._id);

        // delete documents with these ids
        await Page.deleteMany({
            _id: { $in: pageIds }
        });

        res.json({ message: "Latest spread deleted" });
    } catch {
        res.status(500).json({ message: "Failed to delete spread" });
    }
});

export default router;