import { forwardRef } from "react";

const BookCover = forwardRef(({ onClick, hintRef }, ref) => {
    return (
        <div className="book-cover" ref={ref} onClick={onClick}>
            <div className="cover-title">inkveil</div>
            <div className="cover-hint" ref={hintRef}>
                click here
            </div>
        </div>
    );
});

export default BookCover;