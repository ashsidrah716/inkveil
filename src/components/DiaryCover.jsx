import { forwardRef } from "react";
import Diary from "./Diary";

const DiaryCover = forwardRef(({ pages, isOpen, updatePage, pagesRef, syncPages }, ref) => {
    return (
        <div className={`diary-cover ${isOpen ? "open" : "closed"}`}>
            <Diary ref={ref} pages={pages} updatePage={updatePage} pagesRef={pagesRef} syncPages={syncPages} />
        </div >
    );
});

export default DiaryCover;