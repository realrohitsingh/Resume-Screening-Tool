import React, { useState } from "react";

const AISuggestions = ({ field, onUpdate }) => {
  const [suggestion, setSuggestion] = useState("");

  const generateSuggestion = () => {
    const suggestions = {
      experience: [
        "Led a team of developers to build a scalable web application.",
        "Managed project timelines and coordinated with stakeholders.",
        "Optimized website performance and increased user engagement by 30%."
      ]
    };
    setSuggestion(suggestions[field][Math.floor(Math.random() * suggestions[field].length)]);
  };

  return (
    <div>
      <button onClick={generateSuggestion}>AI Suggest</button>
      {suggestion && (
        <p onClick={() => onUpdate(suggestion)} className="suggestion">
          {suggestion}
        </p>
      )}
    </div>
  );
};

export default AISuggestions;
