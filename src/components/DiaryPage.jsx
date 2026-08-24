import { forwardRef } from "react";

const DiaryPage = forwardRef(({ number }, ref) => {
    return (
        <div className="page" ref={ref}>
            <div className="page-content">
                <div className="page-middle">
                    <textarea
                        className="journal-input"
                        placeholder="Dear diary..."
                        onPointerDown={(e) => {
                            e.currentTarget.focus();
                        }}
                    />
                </div>
                <div className="page-footer">{number}</div>
            </div>
        </div>
    );
});

export default DiaryPage;