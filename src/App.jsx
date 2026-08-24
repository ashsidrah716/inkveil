import { useRef } from 'react'
import './App.css'
import DiaryCover from './components/DiaryCover';

function App() {
  const bookRef = useRef();

  const goPrev = () => bookRef.current?.pageFlip().flipPrev();
  const goNext = () => bookRef.current?.pageFlip().flipNext();

  return (
    <div className="app">
      <button className="page-arrow left-arrow" onClick={goPrev}>
        ◀
      </button>

      <DiaryCover ref={bookRef} />

      <button className="page-arrow right-arrow" onClick={goNext}>
        ▶
      </button>
    </div>
  );
}

export default App