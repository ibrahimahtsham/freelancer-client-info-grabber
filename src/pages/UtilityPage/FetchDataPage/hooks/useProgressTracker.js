import { useState, useCallback, useRef } from "react";

export function useProgressTracker() {
  const [progressData, setProgressData] = useState({
    overall: 0,
    currentCategory: null,
    categories: {},
    totalEstimatedTime: 0,
    elapsedTime: 0,
    eta: null,
  });

  const categoryTimers = useRef({});
  const categoryWeights = useRef({
    // Updated weights based on your actual performance data (81 bids = 78s total)
    user_id: { weight: 1, estimated: 500 }, // 1% - Very quick (0s observed)
    bids: { weight: 3, estimated: 2000 }, // 3% - Quick fetch (2s observed)
    projects: { weight: 8, estimated: 6000 }, // 8% - Moderate (6s observed)
    threads: { weight: 65, estimated: 51000 }, // 65% - MAJOR bottleneck (51s observed!)
    payments: { weight: 1, estimated: 500 }, // 1% - Quick when applicable (0s observed)
    clients: { weight: 22, estimated: 17000 }, // 22% - Significant time (17s observed)
    processing: { weight: 0.5, estimated: 200 }, // 0.5% - Very quick (0s observed)
  });

  const overallStartTime = useRef(null);

  const startCategory = useCallback(
    (categoryName) => {
      const now = Date.now();

      // Track overall start time
      if (!overallStartTime.current) {
        overallStartTime.current = now;
      }

      categoryTimers.current[categoryName] = {
        startTime: now,
        endTime: null,
        duration: 0,
      };

      setProgressData((prev) => {
        const newData = {
          ...prev,
          currentCategory: categoryName,
          categories: {
            ...prev.categories,
            [categoryName]: {
              status: "in-progress",
              startTime: now,
              duration: 0,
              progress: 0,
            },
          },
        };

        // Calculate ETA based on current progress and elapsed time
        const elapsedTime = now - (overallStartTime.current || now);
        newData.elapsedTime = elapsedTime;
        newData.eta = calculateETA(newData, elapsedTime);

        return newData;
      });
    },
    [calculateETA]
  );

  const updateCategoryProgress = useCallback(
    (categoryName, progress, message = "") => {
      setProgressData((prev) => {
        const now = Date.now();
        const elapsedTime = now - (overallStartTime.current || now);

        const newData = {
          ...prev,
          elapsedTime,
          categories: {
            ...prev.categories,
            [categoryName]: {
              ...prev.categories[categoryName],
              progress,
              message,
            },
          },
        };

        // Update ETA
        newData.eta = calculateETA(newData, elapsedTime);

        return newData;
      });
    },
    [calculateETA]
  );

  const endCategory = useCallback(
    (categoryName) => {
      const now = Date.now();
      const timer = categoryTimers.current[categoryName];

      if (timer) {
        timer.endTime = now;
        timer.duration = now - timer.startTime;

        setProgressData((prev) => {
          const elapsedTime = now - (overallStartTime.current || now);

          const updatedCategories = {
            ...prev.categories,
            [categoryName]: {
              ...prev.categories[categoryName],
              status: "completed",
              endTime: now,
              duration: timer.duration,
              progress: 100,
            },
          };

          // Calculate overall progress based on completed categories and their weights
          let totalProgress = 0;
          Object.entries(updatedCategories).forEach(([catName, catData]) => {
            if (catData.status === "completed") {
              totalProgress += categoryWeights.current[catName]?.weight || 0;
            } else if (catData.status === "in-progress") {
              const weight = categoryWeights.current[catName]?.weight || 0;
              totalProgress += (weight * catData.progress) / 100;
            }
          });

          const newData = {
            ...prev,
            currentCategory: null,
            overall: Math.min(totalProgress, 100),
            categories: updatedCategories,
            elapsedTime,
          };

          // Update ETA
          newData.eta = calculateETA(newData, elapsedTime);

          return newData;
        });
      }
    },
    [calculateETA]
  );

  const resetProgress = useCallback(() => {
    categoryTimers.current = {};
    overallStartTime.current = null;
    setProgressData({
      overall: 0,
      currentCategory: null,
      categories: {},
      totalEstimatedTime: 0,
      elapsedTime: 0,
      eta: null,
    });
  }, []);

  // Calculate ETA based on current progress and performance
  const calculateETA = useCallback((progressData, elapsedTime) => {
    if (progressData.overall <= 0 || progressData.overall >= 100) {
      return null;
    }

    // Calculate rate of progress (percentage per millisecond)
    const progressRate = progressData.overall / elapsedTime;

    if (progressRate <= 0) {
      return null;
    }

    // Calculate remaining percentage and estimated time
    const remainingProgress = 100 - progressData.overall;
    const estimatedRemainingTime = remainingProgress / progressRate;

    return {
      remainingTimeMs: estimatedRemainingTime,
      estimatedCompletionTime: Date.now() + estimatedRemainingTime,
    };
  }, []);

  // Update category weights based on actual performance
  const updateCategoryWeight = useCallback((categoryName, actualDuration) => {
    const category = categoryWeights.current[categoryName];
    if (category) {
      // Adjust estimated time based on actual performance (weighted moving average)
      category.estimated = Math.round(
        category.estimated * 0.7 + actualDuration * 0.3
      );
    }
  }, []);

  return {
    progressData,
    startCategory,
    updateCategoryProgress,
    endCategory,
    resetProgress,
    updateCategoryWeight,
    getCategoryStats: () => categoryWeights.current,
  };
}
