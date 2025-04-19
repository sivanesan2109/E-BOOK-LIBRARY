import { useState, useEffect } from "react";

export default function HighlightReader() {
  const [selectedText, setSelectedText] = useState("");

  // Capture highlighted text
  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim()); // Update with new selection
    }
  };

  // Read text aloud
  const readTextAloud = () => {
    if (selectedText) {
      speechSynthesis.cancel(); // Stop previous speech
      const speech = new SpeechSynthesisUtterance(selectedText);
      speechSynthesis.speak(speech);
    }
  };

  // Listen for text selection changes
  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <p className="text-gray-700">
        Select any text in this paragraph to highlight it and read it aloud.
      </p>

      {selectedText && (
        <div className="mt-4 p-2 bg-yellow-200 rounded">
          <p className="font-semibold">Selected Text:</p>
          <p className="text-black">{selectedText}</p>

          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={readTextAloud}
          >
            Read Aloud
          </button>
        </div>
      )}
    </div>
  );
}
