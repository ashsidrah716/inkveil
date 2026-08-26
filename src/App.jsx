import { useRef, useState } from 'react'
import './App.css'
import DiaryCover from './components/DiaryCover';

function App() {
  const bookRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const initialPages = ["", "", "", ""];

  const [pages, setPages] = useState(initialPages);
  const pagesRef = useRef(initialPages);

  // update text of a page
  const updatePage = (pageIndex, text) => {
    pagesRef.current[pageIndex] = text;
    // no setPages here — text changes shouldn't trigger a re-render
  };

  const syncPages = () => {
    setPages([...pagesRef.current]);
    // triggeres rerender too
  };

  // arrows
  const goPrev = () => {
    if (!isOpen) return;

    console.log("goPrev");
    console.log("bookRef.current:", bookRef.current);
    console.log("isOpen:", isOpen);

    // if book is closed, don't let 'flip to previous button' appear
    bookRef.current?.pageFlip().flipPrev();
  };

  const goNext = () => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    console.log("goNext");
    console.log("bookRef.current:", bookRef.current);
    console.log("isOpen:", isOpen);


    bookRef.current?.pageFlip().flipNext();
  };

  return (
    <div className="app">
      <button className="page-arrow left-arrow" onClick={goPrev}>
        ◀
      </button>

      <DiaryCover ref={bookRef} pages={pages} isOpen={isOpen} updatePage={updatePage} pagesRef={pagesRef} syncPages={syncPages} />

      <button className="page-arrow right-arrow" onClick={goNext}>
        ▶
      </button>
    </div>
  );
}

export default App;