import { useState, useEffect } from "react";

export function useTimer() {
  // Timer state
  const [timer, setTimer] = useState({
    isRunning: false,
    startTime: null,
    duration: null,
  });

  // Timer effect
  useEffect(() => {
    let interval;

    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const currentDuration = Math.floor(
          (Date.now() - timer.startTime) / 1000
        );
        setTimer((prev) => ({ ...prev, duration: currentDuration }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  // Format timer display
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    setTimer({ isRunning: true, startTime: Date.now(), duration: 0 });
  };

  const stopTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: false }));
  };

  return {
    timer,
    formatTime,
    startTimer,
    stopTimer,
  };
}
