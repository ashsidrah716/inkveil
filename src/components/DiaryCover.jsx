import { forwardRef } from "react";
import Diary from "./Diary";

const DiaryCover = forwardRef((props, ref) => {
    return (
        <div className="diary-cover">
            <Diary ref={ref} />
        </div>
    );
});

export default DiaryCover;