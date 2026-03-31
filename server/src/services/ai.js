const quizBank = [
  {
    q: "What is Newton's Second Law?",
    opts: ["F = ma", "E = mc^2", "v = u + at", "F = mv"],
    ans: 0,
    exp: "Force equals mass times acceleration."
  },
  {
    q: "Powerhouse of the cell?",
    opts: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
    ans: 2,
    exp: "Mitochondria produce ATP through cellular respiration."
  },
  {
    q: "Which data structure uses LIFO?",
    opts: ["Queue", "Stack", "Linked List", "Tree"],
    ans: 1,
    exp: "Stack uses Last In, First Out."
  },
  {
    q: "Integral of sin(x)?",
    opts: ["cos(x)+C", "-cos(x)+C", "tan(x)+C", "-sin(x)+C"],
    ans: 1,
    exp: "Integral of sin(x) is -cos(x) + C."
  },
  {
    q: "Chemical formula for water?",
    opts: ["H2O2", "HO", "H2O", "H3O"],
    ans: 2,
    exp: "Water is H2O."
  }
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function decodeHtml(text = "") {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&uuml;/g, "u");
}

function categoryFromTopic(topic = "") {
  const value = topic.toLowerCase();
  if (value.includes("math") || value.includes("calculus") || value.includes("algebra")) return "19";
  if (value.includes("computer") || value.includes("program") || value.includes("data structure")) return "18";
  if (
    value.includes("physics") ||
    value.includes("chemistry") ||
    value.includes("biology") ||
    value.includes("science")
  ) {
    return "17";
  }
  if (value.includes("history")) return "23";
  if (value.includes("geography")) return "22";
  return "";
}

async function fetchStudyTip() {
  try {
    const response = await fetch("https://api.adviceslip.com/advice", { method: "GET" });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.slip?.advice || null;
  } catch (_error) {
    return null;
  }
}

export async function generatePlan({ subjects, hours }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const onlineTip = await fetchStudyTip();

  return days.map((day, i) => {
    const subject = subjects[i % subjects.length] || "General";
    return {
      day,
      focus: subject,
      tasks: [
        `${subject} core concepts review`,
        `${subject} problem practice (${Math.max(1, Math.ceil(hours / 2))}h)`,
        "15-minute active recall session"
      ],
      tip:
        onlineTip ||
        "Consistency beats intensity. Keep sessions focused and short breaks intentional."
    };
  });
}

function buildFallbackQuiz(topic = "") {
  if (!topic) return quizBank;
  return quizBank.map((q) => ({ ...q, q: `${q.q} (${topic})` }));
}

export async function generateQuiz(topic) {
  try {
    const params = new URLSearchParams({ amount: "5", type: "multiple" });
    const category = categoryFromTopic(topic || "");
    if (category) {
      params.set("category", category);
    }
    params.set("encode", "url3986");

    const response = await fetch(`https://opentdb.com/api.php?${params.toString()}`, { method: "GET" });
    if (!response.ok) {
      return { source: "fallback", questions: buildFallbackQuiz(topic) };
    }

    const payload = await response.json();
    const results = payload?.results || [];
    if (!Array.isArray(results) || results.length === 0) {
      return { source: "fallback", questions: buildFallbackQuiz(topic) };
    }

    const questions = results.map((item) => {
      const correct = decodeURIComponent(item.correct_answer || "");
      const incorrect = (item.incorrect_answers || []).map((answer) => decodeURIComponent(answer));
      const options = shuffle([correct, ...incorrect]).map((opt) => decodeHtml(opt));
      const answerIndex = options.findIndex((opt) => opt === decodeHtml(correct));

      const questionText = decodeHtml(decodeURIComponent(item.question || ""));
      return {
        q: topic?.trim() ? `${questionText} (${topic})` : questionText,
        opts: options,
        ans: answerIndex < 0 ? 0 : answerIndex,
        exp: `Category: ${decodeHtml(decodeURIComponent(item.category || "General"))}`
      };
    });

    return { source: "online", questions };
  } catch (_error) {
    return { source: "fallback", questions: buildFallbackQuiz(topic) };
  }
}

export async function tutorReply(message) {
  const text = (message || "").toLowerCase();
  if (!text.trim()) {
    return {
      source: "fallback",
      reply: "Share the exact topic or question and I will explain it step by step."
    };
  }

  const topic = encodeURIComponent(message.trim().split("?")[0].slice(0, 80));
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`, {
      method: "GET",
      headers: { "User-Agent": "StudyAI/1.0" }
    });

    if (response.ok) {
      const payload = await response.json();
      const extract = payload?.extract || "";
      if (extract.trim()) {
        const concise = extract.split(". ").slice(0, 3).join(". ");
        return { source: "wikipedia", reply: concise };
      }
    }
  } catch (_error) {
    // Fall through to local fallback response.
  }

  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(message)}&format=json&no_html=1&skip_disambig=1`,
      { method: "GET" }
    );
    if (response.ok) {
      const payload = await response.json();
      const summary = payload?.AbstractText || payload?.Answer || "";
      if (summary.trim()) {
        const concise = summary.split(". ").slice(0, 3).join(". ");
        return { source: "duckduckgo", reply: concise };
      }
    }
  } catch (_error) {
    // Fall through to local fallback response.
  }

  if (text.includes("newton")) {
    return {
      source: "fallback",
      reply:
        "Newton's second law says acceleration is produced when a force acts on mass: F = ma. Larger force gives larger acceleration, while larger mass resists acceleration."
    };
  }

  if (text.includes("photosynthesis")) {
    return {
      source: "fallback",
      reply:
        "Photosynthesis is how plants make glucose using sunlight, water, and carbon dioxide, releasing oxygen as a by-product."
    };
  }

  if (text.includes("study") || text.includes("plan")) {
    return {
      source: "fallback",
      reply:
        "Use 45-minute focus blocks, 10-minute breaks, and finish each session with 5 minutes of active recall. Track weak topics daily."
    };
  }

  return {
    source: "fallback",
    reply:
      "Great question. Break it into definition, formula or principle, and one worked example. If you share the exact chapter, I can tailor a clearer explanation."
  };
}
