const topicDefaultLanguage = (topic: string) => {
    switch (topic) {
      case "backend":
        return "python"; // FastAPI in your workspace
      case "frontend":
        return "typescript"; // Next.js/TS
      case "ml":
        return "python";
      default:
        return "typescript";
    }
  };
  
  const LANGUAGE_OPTIONS = [
    { id: "typescript", label: "TypeScript" },
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "sql", label: "SQL" },
    { id: "bash", label: "Bash" },
  ] as const;