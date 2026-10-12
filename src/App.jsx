
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerLabel, setTimerLabel] = useState("Session");
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);
  const beepRef = useRef(null);

  // Format seconds as mm:ss.
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Stop the interval.
  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Adjust break length between 1 and 60 minutes.
  const changeBreakLength = (amount) => {
    if (isRunning) return;

    setBreakLength((previous) =>
      Math.min(60, Math.max(1, previous + amount))
    );
  };

  // Adjust session length between 1 and 60 minutes.
  const changeSessionLength = (amount) => {
    if (isRunning) return;

    setSessionLength((previous) => {
      const updated = Math.min(60, Math.max(1, previous + amount));

      // Update the display if it still shows the original session duration.
      setTimeLeft((currentTime) => {
        if (
          timerLabel === "Session" &&
          currentTime === previous * 60
        ) {
          return updated * 60;
        }

        return currentTime;
      });

      return updated;
    });
  };

  // Reset the entire clock.
  const resetTimer = () => {
    stopTimer();

    setIsRunning(false);
    setBreakLength(5);
    setSessionLength(25);
    setTimeLeft(25 * 60);
    setTimerLabel("Session");

    if (beepRef.current) {
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
    }
  };

  // Start, pause, or resume.
  const toggleTimer = () => {
    setIsRunning((previous) => !previous);
  };

  useEffect(() => {
    if (!isRunning) {
      stopTimer();
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime > 1) {
          return previousTime - 1;
        }

        // Reach 00:00 before switching to the next period.
        if (previousTime === 1) {
          return 0;
        }

        // Play the beep when the timer is already at 00:00.
        if (beepRef.current) {
          beepRef.current.currentTime = 0;

          const playPromise = beepRef.current.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Unable to play beep:", error);
            });
          }
        }

        if (timerLabel === "Session") {
          setTimerLabel("Break");
          return breakLength * 60;
        }

        setTimerLabel("Session");
        return sessionLength * 60;
      });
    }, 1000);

    return () => stopTimer();
  }, [isRunning, timerLabel, breakLength, sessionLength]);

  return (
    <main className="clock-app">
      <h1 className="app-title">25 + 5 Clock</h1>

      <section className="length-settings">
        <div className="length-box">
          <h2 id="break-label">Break Length</h2>

          <div className="length-controls">
            <button
              id="break-decrement"
              onClick={() => changeBreakLength(-1)}
              disabled={isRunning || breakLength <= 1}
              aria-label="Decrease break length"
            >
              −
            </button>

            <span id="break-length">{breakLength}</span>

            <button
              id="break-increment"
              onClick={() => changeBreakLength(1)}
              disabled={isRunning || breakLength >= 60}
              aria-label="Increase break length"
            >
              +
            </button>
          </div>
        </div>

        <div className="length-box">
          <h2 id="session-label">Session Length</h2>

          <div className="length-controls">
            <button
              id="session-decrement"
              onClick={() => changeSessionLength(-1)}
              disabled={isRunning || sessionLength <= 1}
              aria-label="Decrease session length"
            >
              −
            </button>

            <span id="session-length">{sessionLength}</span>

            <button
              id="session-increment"
              onClick={() => changeSessionLength(1)}
              disabled={isRunning || sessionLength >= 60}
              aria-label="Increase session length"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <section className="timer-box">
        <h2 id="timer-label">{timerLabel}</h2>

        <div
          id="time-left"
          className={timeLeft <= 60 ? "time-warning" : ""}
        >
          {formatTime(timeLeft)}
        </div>

        <div className="timer-controls">
          <button id="start_stop" onClick={toggleTimer}>
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>

          <button id="reset" onClick={resetTimer}>
            ↻ Reset
          </button>
        </div>
      </section>

      <p className="footer-text">Focus • Take a break • Repeat</p>

      <audio
        id="beep"
        ref={beepRef}
        preload="auto"
        src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
      />
    </main>
  );
}

export default App;
