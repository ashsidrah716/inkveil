import { forwardRef } from "react";
import Diary from "./Diary";

const DiaryCover = forwardRef(({ pages, isOpen, updatePage, pagesRef, syncPages, playFlipSound }, ref) => {
    return (
        <div className={`diary-cover ${isOpen ? "open" : "closed"}`}>
            <Diary ref={ref} pages={pages} updatePage={updatePage} pagesRef={pagesRef} syncPages={syncPages} playFlipSound={playFlipSound} />
        </div >
    );
});

export default DiaryCover;