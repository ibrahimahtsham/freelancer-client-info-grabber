const token = "H7FfoHyqJxr9xKwECCgvseWyyCcMRu";

function logResponse(data, source) {
  console.log(`[DEBUG] Raw response from ${source}:`, data);
}

function formatEpochToPakistanTime(epochSeconds) {
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
}

function isTimeInRange(time, start, end) {
  const [hours, minutes] = time.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const [startHours, startMinutes] = start.split(":").map(Number);
  const startInMinutes = startHours * 60 + startMinutes;

  const [endHours, endMinutes] = end.split(":").map(Number);
  const endInMinutes = endHours * 60 + endMinutes;

  if (startInMinutes <= endInMinutes) {
    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  } else {
    return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
  }
}

async function countThreadsByTimeRange(startDate, endDate, timeRanges) {
  const output = document.getElementById("threadCountOutput");
  output.innerText = "⏳ Counting threads...";

  try {
    // Fetch all threads
    const threadsRes = await fetch(
      `https://www.freelancer.com/api/messages/0.1/threads/`,
      {
        headers: { "freelancer-oauth-v1": token },
      }
    );

    const threadsData = await threadsRes.json();
    logResponse(threadsData, "Threads API");

    if (threadsData.status === "error") {
      throw new Error(threadsData.message);
    }

    const threads = threadsData?.result?.threads || [];
    console.log(
      "[DEBUG] All thread IDs:",
      threads.map((t) => t.id)
    );

    let threadCount = 0;

    // Iterate over threads to find related projects
    for (const thread of threads) {
      const projectId = thread.context?.id;

      if (!projectId) {
        console.log(
          `[DEBUG] Thread ID ${thread.id} has no associated project ID.`
        );
        continue;
      }

      console.log(
        `[DEBUG] Fetching project details for Project ID ${projectId}...`
      );

      // Fetch project details for the related project ID
      const projectRes = await fetch(
        `https://www.freelancer.com/api/projects/0.1/projects/${projectId}/`,
        {
          headers: { "freelancer-oauth-v1": token },
        }
      );

      const projectData = await projectRes.json();
      logResponse(projectData, `Project API for Project ID ${projectId}`);

      if (projectData.status === "error") {
        console.error(
          `[ERROR] Failed to fetch project details for Project ID ${projectId}: ${projectData.message}`
        );
        continue;
      }

      const project = projectData?.result || {};
      const submitTime = new Date(project.submitdate * 1000);
      const submitTimeString = submitTime
        .toISOString()
        .split("T")[1]
        .slice(0, 5);

      console.log(
        `[DEBUG] Project ID ${projectId} submission time: ${submitTime}`
      );
      console.log(`[DEBUG] Submission time string: ${submitTimeString}`);

      // Check if the project is within the date range
      if (submitTime < new Date(startDate) || submitTime > new Date(endDate)) {
        console.log(
          `[DEBUG] Project ID ${projectId} is outside the date range.`
        );
        continue;
      }

      // Check if the project submission time is within the time ranges
      const isInTimeRange = timeRanges.some(([start, end]) =>
        isTimeInRange(submitTimeString, start, end)
      );

      if (!isInTimeRange) {
        console.log(
          `[DEBUG] Project ID ${projectId} is outside the time ranges.`
        );
        continue;
      }

      console.log(
        `[DEBUG] Thread ID ${thread.id} is related to Project ID ${projectId} and matches the criteria.`
      );
      threadCount++;
    }

    output.innerText = `✅ Total Threads: ${threadCount}`;
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    output.innerText = `❌ ${err.message}`;
  }
}

document.getElementById("countThreadsBtn").addEventListener("click", () => {
  const startDate = document.getElementById("startDateInput").value;
  const endDate = document.getElementById("endDateInput").value;
  const timeRange1Start = document.getElementById("timeRange1Start").value;
  const timeRange1End = document.getElementById("timeRange1End").value;
  const timeRange2Start = document.getElementById("timeRange2Start").value;
  const timeRange2End = document.getElementById("timeRange2End").value;

  if (!startDate || !endDate) {
    return alert("Please select both start and end dates.");
  }

  const timeRanges = [
    [timeRange1Start, timeRange1End],
    [timeRange2Start, timeRange2End],
  ];

  countThreadsByTimeRange(startDate, endDate, timeRanges);
});
