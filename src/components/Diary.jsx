import { forwardRef, useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import DiaryPage from "./DiaryPage";

const Diary = forwardRef((props, ref) => {
    const containerRef = useRef(null);
    const [size, setSize] = useState({ width: 600, height: 400 });

    useEffect(() => {
        // get the container element
        const el = containerRef.current;
        if (!el) return;

        // browser resize observer to detect changes in the container size
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setSize({ width, height });
            }
        });

        // observe the container element for size changes and remove observer on cleanup
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="diary">
            <div className="diary-header">diary header</div>

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
                >
                    <DiaryPage number={1} />
                    <DiaryPage number={2} />
                    <DiaryPage number={3} />
                    <DiaryPage number={4} />
                </HTMLFlipBook>
            </div>
        </div>
    );
});

export default Diary;