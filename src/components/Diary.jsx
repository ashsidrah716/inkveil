import { forwardRef, useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import DiaryPage from "./DiaryPage";

import { splitFittingText } from "../utils/textOverflow";
import { deletePages, updatePages } from "../api/pagesApi";

const Diary = forwardRef(({ pages, updatePage, pagesRef, syncPages, playFlipSound }, ref) => {
    const containerRef = useRef(null);
    const [size, setSize] = useState({ width: 600, height: 400 });
    const inputsRef = useRef([]);
    const pendingFocusRef = useRef(null);
    const pagesCreatedRef = useRef(false);
    const deletePendingRef = useRef(false);

    // make the flipbook responsive to the container size
    useEffect(() => {
        // get the container element
        const el = containerRef.current;
        if (!el) return;

        // browser resize observer to detect changes in the container size
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;

            // round the sizes so decimal changes don't trigger rerenders
            const w = Math.round(width);
            const h = Math.round(height);

            if (w > 0 && h > 0) {
                setSize(prev =>
                    width === w && height === h ? prev : { width: w, height: h });
            }
        });

        // observe the container element for size changes and remove observer on cleanup
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Pushes `incomingText` into pageIndex, splitting further if it still overflows.
    // cursorOffset (or null) tracks where the live cursor should end up, if at all.
    const cascadeOverflow = (pageIndex, incomingText, cursorOffset) => {

        // Grow the data array as needed — no DOM or React render required yet. 
        while (pagesRef.current.length <= pageIndex) {
            pagesRef.current.push({
                pageNumber: pagesRef.current.length + 1,
                content: "",
                bookmarked: false,
                updatedAt: new Date()
            });

            pagesCreatedRef.current = true;
        }

        // ensure total page count stays even (whole spreads)
        if (pagesRef.current.length % 2 !== 0) {
            pagesRef.current.push({
                pageNumber: pagesRef.current.length + 1,
                content: "",
                bookmarked: false,
                updatedAt: new Date()
            });
        }

        // measurement of visible textarea
        const measurementInput = inputsRef.current.find(
            (input) => input && input.clientWidth > 0 && input.clientHeight > 0
        );

        if (!measurementInput) {
            console.log("NO VISIBLE TEXTAREA TO MEASURE WITH");
            return;
        }

        // get overflow page textarea
        const input = inputsRef.current[pageIndex];

        // The page may not be mounted yet. Its text still lives in pagesRef (either as empty string or overflow text)
        // pagesRef gives the text
        const existing = input ? input.value : pagesRef.current[pageIndex].content;
        const combinedText = existing ? `${incomingText} ${existing}` : incomingText;

        // check if new text is overflowing and set text to only what fits
        const { fittingText, overflowText, splitIndex, removedLeading } =
            splitFittingText(combinedText, measurementInput);

        // Always write the result to the ref — it is the source of truth. 
        pagesRef.current[pageIndex].content = fittingText;

        // If the textarea is currently mounted, update it immediately too. 
        if (input) { input.value = fittingText; }

        // if nothing is overflowing next, stop cascading
        if (!overflowText) {
            // everything fit — this is the end of the chain
            if (cursorOffset !== null) {
                const localPos = Math.min(cursorOffset, fittingText.length);
                pendingFocusRef.current = { index: pageIndex, cursorPos: localPos };
            }
            return;
        }

        // this page overflowed too — the rest keeps cascading regardless of cursor
        // cursor is not within the overflow
        if (cursorOffset !== null && cursorOffset <= splitIndex) {
            const localPos = Math.min(cursorOffset, fittingText.length);
            pendingFocusRef.current = { index: pageIndex, cursorPos: localPos };
            cascadeOverflow(pageIndex + 1, overflowText, null); // cursor found its home; keep pushing the rest
        } else { // cursor is within the mazeed overflow
            const adjustedOffset = cursorOffset !== null
                ? Math.max(0, (cursorOffset - splitIndex) - removedLeading)
                : null;
            cascadeOverflow(pageIndex + 1, overflowText, adjustedOffset);
        }
    };

    // hand over overflow to cascading, handle focus
    const handleOverflow = (pageIndex, overflowText, cursorOffset) => {
        const currentSpread = Math.floor(pageIndex / 2);
        pendingFocusRef.current = null;
        pagesCreatedRef.current = false;

        cascadeOverflow(pageIndex + 1, overflowText, cursorOffset);

        // The ENTIRE cascade is now finished. 
        // React gets the final data only once, after every page has been updated. 
        if (pagesCreatedRef.current) {
            syncPages();
        }

        if (!pendingFocusRef.current) return; // cursor never left the original page

        // index of what page it needs to move to
        const { index } = pendingFocusRef.current;
        const targetSpread = Math.floor(index / 2);

        if (targetSpread > currentSpread) {
            ref.current?.pageFlip().flipNext(); // focus applied in onFlip once it truly finishes
            playFlipSound();
        } else {
            const { cursorPos } = pendingFocusRef.current;
            inputsRef.current[index]?.focus();
            inputsRef.current[index]?.setSelectionRange(cursorPos, cursorPos);
            pendingFocusRef.current = null;
        }

    };


    // add new spread
    const addSpread = () => {
        const nextPageNumber = pagesRef.current.length + 1;
        // console.log(nextPageNumber);
        // console.log(pagesRef.current.length);

        pagesRef.current.push(
            {
                pageNumber: nextPageNumber,
                content: "",
                bookmarked: false,
                updatedAt: new Date(),
            },
            {
                pageNumber: nextPageNumber + 1,
                content: "",
                bookmarked: false,
                updatedAt: new Date(),
            }
        );

        syncPages();
    };

    // update pages and save to MongoDB
    const savePages = async () => {
        try {
            const updatedPages = await updatePages(pagesRef.current);

            // console.log("UPDATED PAGES:", updatedPages);
            // console.log("IS ARRAY:", Array.isArray(updatedPages));

            pagesRef.current = updatedPages;
            syncPages();

            // console.log("Pages saved");
        } catch (error) {
            console.error("Failed to update pages:", error);
        }
    };

    // delete last spread
    const deleteSpread = async () => {
        if (pagesRef.current.length <= 2) return;

        const currentPage = ref.current?.pageFlip().getCurrentPageIndex();
        const lastPage = pagesRef.current.length - 1;

        // if we're on the last spread, flip back first
        if (currentPage >= lastPage - 1) {
            deletePendingRef.current = true;
            playFlipSound();
            ref.current?.pageFlip().flipPrev();
            return;
        }

        // otherwise delete right away
        try {
            // first from backend
            await deletePages();

            // then from local data
            pagesRef.current.splice(-2, 2);
            syncPages();
        } catch (error) {
            console.error("Failed to delete spread", error);
        }
    };

    return (
        <div className="diary">
            <div className="diary-header">
                <button className="add-page-button" title="Add pages" onClick={addSpread}>
                    <i className="ri-add-fill add-button-normal"></i>
                    <i className="ri-add-box-fill add-button-hover"></i>
                </button>

                <button className="bookmark-button" title="Bookmark spread">
                    <i className="ri-bookmark-line bookmark-button-normal"></i>
                    <i className="ri-bookmark-fill bookmark-button-hover"></i>
                </button>

                <button className="save-button" title="Save changes" onClick={savePages}>
                    <i className="ri-save-line save-button-normal"></i>
                    <i className="ri-save-fill save-button-hover"></i>
                </button>

                <button className="delete-button" title="Delete last spread" onClick={deleteSpread}>
                    <i className="ri-delete-bin-6-line delete-button-normal"></i>
                    <i className="ri-delete-bin-6-fill delete-button-hover"></i>
                </button>
            </div>

            <div className="diary-pages" ref={containerRef}>
                <HTMLFlipBook
                    key={`${size.width}-${size.height}`}
                    width={size.width / 2}
                    height={size.height}
                    size="fixed"
                    showCover={false}
                    usePortrait={false}
                    // disableFlipByClick={true}
                    useMouseEvents={false}
                    // showPageCorners={false}
                    mobileScrollSupport={false}
                    ref={ref}
                    onFlip={() => {
                        // position cursor once flipping animation stops, if it was in the overflow
                        if (pendingFocusRef.current) {
                            const { index, cursorPos } = pendingFocusRef.current;
                            inputsRef.current[index]?.focus();
                            inputsRef.current[index]?.setSelectionRange(cursorPos, cursorPos);
                            pendingFocusRef.current = null;
                        }
                    }}
                    onChangeState={(e) => {
                        // console.log("Page Flip State: ", e.data);

                        if (e.data === "read" && deletePendingRef.current) {
                            deletePendingRef.current = false;

                            deletePages()
                                .then(() => {
                                    pagesRef.current.splice(-2, 2);
                                    syncPages();
                                })
                                .catch((error) => {
                                    console.error("Failed to delete spread", error);
                                });
                        }
                    }}
                >
                    {/* rendering pages dynamically */}
                    {pages.map((page, index) => (
                        <DiaryPage
                            key={page._id}
                            number={page.pageNumber}
                            text={page.content}
                            onChange={(newText) => updatePage(index, newText)}
                            onOverflow={(overflowText, cursorOffset) => handleOverflow(index, overflowText, cursorOffset)}
                            inputRef={(el) => {
                                // el is textarea received from DiaryPage
                                inputsRef.current[index] = el;
                            }}
                        />
                    ))}
                </HTMLFlipBook>
            </div>
        </div>
    );
});

export default Diary;