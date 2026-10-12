
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

  // Convert seconds into mm:ss format.
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Clear the timer interval.
  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Change break length.
  const changeBreakLength = (amount) => {
    if (isRunning) return;

    setBreakLength((previous) =>
      Math.min(60, Math.max(1, previous + amount))
    );
  };

  // Change session length.
  const changeSessionLength = (amount) => {
    if (isRunning) return;

    setSessionLength((previous) =>
      Math.min(60, Math.max(1, previous + amount))
    );

    // Update the displayed timer only during a session.
    if (timerLabel === "Session") {
      setTimeLeft((previous) => {
        const currentMinutes = Math.floor(previous / 60);

        // Update the timer when it still reflects the session length.
        if (
          currentMinutes === sessionLength &&
          previous % 60 === 0
        ) {
          return (sessionLength + amount) * 60;
        }

        return previous;
      });
    }
  };

  // Reset everything to its default values.
  const resetTimer = () => {
    stopTimer();

    setIsRunning(false);
    setBreakLength(5);
    setSessionLength(25);
    setTimerLabel("Session");
    setTimeLeft(25 * 60);

    if (beepRef.current) {
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
    }
  };

  // Start, pause, or resume the countdown.
  const toggleTimer = () => {
    setIsRunning((previous) => !previous);
  };

  useEffect(() => {
    if (!isRunning) {
      stopTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime > 0) {
          return previousTime - 1;
        }

        // The timer has reached 00:00.
        if (beepRef.current) {
          beepRef.current.currentTime = 0;
          beepRef.current.play().catch(() => {});
        }

        if (timerLabel === "Session") {
          setTimerLabel("Break");
          return breakLength * 60;
        } else {
          setTimerLabel("Session");
          return sessionLength * 60;
        }
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
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      />
    </main>
  );
}

export default App;
