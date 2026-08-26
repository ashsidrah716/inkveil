export function splitFittingText(text, textarea) {
    // make a clone of the textarea to measure text height without affecting the original
    const clone = textarea.cloneNode(true);
    const styles = window.getComputedStyle(textarea);

    clone.value = "";
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${textarea.clientWidth}px`;
    clone.style.height = `${textarea.clientHeight}px`;
    clone.style.overflow = "hidden";
    clone.style.font = styles.font;
    clone.style.lineHeight = styles.lineHeight;
    clone.style.letterSpacing = styles.letterSpacing;
    clone.style.padding = styles.padding;
    clone.style.border = styles.border;
    clone.style.boxSizing = styles.boxSizing;
    clone.style.whiteSpace = styles.whiteSpace;
    clone.style.wordWrap = styles.overflowWrap;

    document.body.appendChild(clone);

    // Check full fit FIRST — if everything fits, there's nothing to split.
    clone.value = text;
    if (clone.scrollHeight <= clone.clientHeight) {
        document.body.removeChild(clone);
        return {
            fittingText: text,
            overflowText: "",
            splitIndex: text.length,
            removedLeading: 0,
        };
    }

    // binary search to find the maximum number of characters that fit in the textarea
    let low = 0, high = text.length, splitIndex = text.length;

    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        clone.value = text.slice(0, middle);
        if (clone.scrollHeight <= clone.clientHeight) {
            low = middle + 1;
        } else {
            splitIndex = middle;
            high = middle - 1;
        }
    }

    // find position of last space and newline
    let split = text.lastIndexOf(" ", splitIndex - 1);
    const newlineSplit = text.lastIndexOf("\n", splitIndex - 1);
    // determine which of the two is closer to splitIndex, and use that as the split point
    split = Math.max(split, newlineSplit);
    if (split === -1) split = splitIndex;

    // split text
    const rawOverflow = text.slice(split);
    const fittingText = text.slice(0, split).trimEnd();
    const overflowText = rawOverflow.trimStart();
    const removedLeading = rawOverflow.length - overflowText.length;

    document.body.removeChild(clone);

    return { fittingText, overflowText, splitIndex: split, removedLeading };
}