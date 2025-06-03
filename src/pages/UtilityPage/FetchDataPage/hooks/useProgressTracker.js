import { useState, useCallback, useRef } from "react";

export function useProgressTracker() {
  const [progressData, setProgressData] = useState({
    overall: 0,
    currentCategory: null,
    categories: {},
    totalEstimatedTime: 0,
    elapsedTime: 0,
  });

  const categoryTimers = useRef({});
  const categoryWeights = useRef({
    user_id: { weight: 5, estimated: 2000 }, // 5% - Quick user ID fetch
    bids: { weight: 25, estimated: 15000 }, // 25% - Main bids fetch
    projects: { weight: 20, estimated: 12000 }, // 20% - Project details
    threads: { weight: 20, estimated: 12000 }, // 20% - Thread info
    payments: { weight: 15, estimated: 10000 }, // 15% - Payment details
    clients: { weight: 10, estimated: 8000 }, // 10% - Client profiles
    processing: { weight: 5, estimated: 3000 }, // 5% - Data processing
  });

  const startCategory = useCallback((categoryName) => {
    const now = Date.now();

    categoryTimers.current[categoryName] = {
      startTime: now,
      endTime: null,
      duration: 0,
    };

    setProgressData((prev) => ({
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
    }));
  }, []);

  const updateCategoryProgress = useCallback(
    (categoryName, progress, message = "") => {
      setProgressData((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          [categoryName]: {
            ...prev.categories[categoryName],
            progress,
            message,
          },
        },
      }));
    },
    []
  );

  const endCategory = useCallback((categoryName) => {
    const now = Date.now();
    const timer = categoryTimers.current[categoryName];

    if (timer) {
      timer.endTime = now;
      timer.duration = now - timer.startTime;

      setProgressData((prev) => {
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

        return {
          ...prev,
          currentCategory: null,
          overall: Math.min(totalProgress, 100),
          categories: updatedCategories,
        };
      });
    }
  }, []);

  const resetProgress = useCallback(() => {
    categoryTimers.current = {};
    setProgressData({
      overall: 0,
      currentCategory: null,
      categories: {},
      totalEstimatedTime: 0,
      elapsedTime: 0,
    });
  }, []);

  // Update category weights based on actual performance
  const updateCategoryWeight = useCallback((categoryName, actualDuration) => {
    const category = categoryWeights.current[categoryName];
    if (category) {
      // Adjust estimated time based on actual performance (simple moving average)
      category.estimated = Math.round(
        (category.estimated + actualDuration) / 2
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
