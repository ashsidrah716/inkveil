import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import './App.css'
import DiaryCover from './components/DiaryCover';
import pageFlipSoundAsset from './assets/page_flip.wav';
import BookCover from './components/BookCover';

// sounds
const pageFlipSound = new Audio(pageFlipSoundAsset);

function App() {
  const bookRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const initialPages = ["", "", "", ""];

  const [pages, setPages] = useState(initialPages);
  const pagesRef = useRef(initialPages);
  const coverRef = useRef(null);

  // animations
  const diaryStageRef = useRef(null);
  const landingContentRef = useRef(null);
  const coverReadyRef = useRef(false);
  const coverHintRef = useRef(null);

  // landing page content
  useEffect(() => {
    gsap.to(".landing-reveal h1, .landing-reveal p, .landing-reveal button", {
      x: 0,
      duration: 1.5,
      stagger: 0.15,
      ease: "power3.out",
    });

    gsap.fromTo(
      coverRef.current,
      {
        y: 80,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.4,
      }
    );
  }, []);

  // diary
  const handleOpenDiary = () => {
    coverReadyRef.current = false;

    const diary = diaryStageRef.current;
    const cover = coverRef.current;

    const diaryWidth = diary.getBoundingClientRect().width;
    const coverWidth = cover.getBoundingClientRect().width;

    const coverScale = (diaryWidth / coverWidth) * 1.15;

    const tl = gsap.timeline();

    // 1. Move landing content away
    tl.to(landingContentRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power3.in",
    });

    // 2. Bring the cover into the middle
    tl.to(coverRef.current, {
      left: "50%",
      top: "55%",
      scale: coverScale,
      duration: 1.4,
      ease: "power3.inOut",
    });

    tl.to(coverHintRef.current, {
      opacity: 1,
      duration: 0.7,
      ease: "power2.out",
    }, "-=0.8");

    // 3. Move diary underneath the cover
    tl.to(diaryStageRef.current, {
      top: "55%",
      duration: 1,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(diaryStageRef.current, {
          opacity: 1,
        });

        coverReadyRef.current = true;
      },
    });
  };

  // diary cover dissolve
  const handleDissolve = () => {
    // console.log("🔥 COVER CLICKED", coverReadyRef.current);
    // incase the user clicks the cover before the diary is ready
    if (!coverReadyRef.current) return;

    // cover can no longer be clicked
    gsap.set(coverRef.current, {
      pointerEvents: "none",
    });

    // bring diary above everything except the brand
    gsap.set(diaryStageRef.current, {
      zIndex: 30,
    });

    // move landing content below the diary
    gsap.set(landingContentRef.current, {
      zIndex: 20,
    });

    // your existing dissolve animation
    gsap.to(coverRef.current, {
      opacity: 0,
      filter: "blur(20px)",
      duration: 1,
      ease: "power1.out",
    });
  };

  // functions
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

    const currentPage = bookRef.current?.pageFlip().getCurrentPageIndex();
    const previousPage = currentPage - 2;

    if (previousPage >= 0) {
      pageFlipSound.currentTime = 0;
      pageFlipSound.play();

      bookRef.current?.pageFlip().flipPrev();
    }
  };

  const goNext = () => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    const currentPage = bookRef.current?.pageFlip().getCurrentPageIndex();
    const nextPage = currentPage + 2;

    if (nextPage < pages.length) {
      pageFlipSound.currentTime = 0;
      pageFlipSound.play();

      bookRef.current?.pageFlip().flipNext();
    }
  };

  return (
    <div className="app">

      {/* permanent brand */}
      <div className="brand">
        inkveil
      </div>

      {/* landing page content */}
      <div className="landing-content" ref={landingContentRef}>
        <div className="landing-reveal">
          <h1>your diary, your thoughts.</h1>
        </div>

        <div className="landing-reveal">
          <p>
            A quiet place for everything you don't want to forget.
          </p>
        </div>

        <div className="landing-reveal">
          <button onClick={handleOpenDiary}>
            Open diary
          </button>
        </div>
      </div>

      {/* book area */}
      <div className="diary-stage" ref={diaryStageRef}>

        <div className="diary-wrapper">
          <DiaryCover
            ref={bookRef}
            pages={pages}
            isOpen={isOpen}
            updatePage={updatePage}
            pagesRef={pagesRef}
            syncPages={syncPages}
          />

          {/* navigation */}
          <button className="page-arrow left-arrow" onClick={goPrev}>
            ◀
          </button>

          <button className="page-arrow right-arrow" onClick={goNext}>
            ▶
          </button>

        </div>

      </div>

      <BookCover
        ref={coverRef}
        hintRef={coverHintRef}
        onClick={() => {
          if (!coverReadyRef.current) {
            handleOpenDiary();
          } else {
            handleDissolve();
          }
        }}
      />

    </div>
  );
}

export default App;
