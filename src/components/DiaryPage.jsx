import { forwardRef, useEffect, useRef } from "react";
import { splitFittingText } from "../utils/textOverflow";

const DiaryPage = forwardRef(
    ({ number, text, onChange, onOverflow, inputRef }, ref) => {
        const textRef = useRef(text);
        const textareaRef = useRef(null);

        // console.log("🖼️ DIARY PAGE RENDER:", {
        //     number,
        //     text: JSON.stringify(text),
        // });

        // Keep the textarea synchronized when its [text] changes from outside
        useEffect(() => {
            textRef.current = text;

            if (textareaRef.current) {
                textareaRef.current.value = text;
            }
        }, [text]);

        return (
            <div className="page" ref={ref}>
                <div className="page-content">
                    <div className="page-middle">
                        <textarea
                            ref={(el) => {
                                // DiaryPage gets the textarea
                                textareaRef.current = el;

                                // Diary gets the textarea too
                                if (inputRef) {
                                    inputRef(el);
                                }
                            }}
                            className="journal-input"
                            placeholder="Dear diary..."
                            defaultValue={text}
                            onChange={(e) => {
                                const textarea = e.currentTarget;
                                const newText = e.target.value;

                                // Where is the cursor BEFORE we change anything?
                                const cursorPos = textarea.selectionStart;

                                // Does the text overflow?
                                if (textarea.scrollHeight > textarea.clientHeight) {
                                    const {
                                        fittingText,
                                        overflowText,
                                        splitIndex,
                                        removedLeading,
                                    } = splitFittingText(newText, textarea);

                                    // Keep only the part that fits on this page
                                    textarea.value = fittingText;
                                    textRef.current = fittingText;
                                    onChange(fittingText);

                                    // Is the cursor inside the overflow?
                                    const cursorInOverflow = cursorPos > splitIndex;

                                    if (cursorInOverflow) {
                                        // Cursor was inside the text that got moved.
                                        // Tell Diary how far into that overflow it was.
                                        const rawOffset = cursorPos - splitIndex;

                                        const cursorOffset = Math.max(0, rawOffset - removedLeading);

                                        onOverflow(overflowText, cursorOffset);
                                    } else {
                                        // Cursor was NOT in the overflow.
                                        // Move the overflow, but leave focus here.
                                        onOverflow(overflowText, null);

                                        // Put cursor back where it was. Make sure it doesn't go past the end of the fitting text.
                                        const localPos = Math.min(cursorPos, fittingText.length);

                                        textarea.setSelectionRange(localPos, localPos);
                                    }

                                    return;
                                }

                                // Nothing overflowed — normal typing.
                                textRef.current = newText;
                                onChange(newText);
                            }}
                        />
                    </div>

                    <div className="page-footer">{number}</div>
                </div>
            </div>
        );
    }
);

export default DiaryPage;