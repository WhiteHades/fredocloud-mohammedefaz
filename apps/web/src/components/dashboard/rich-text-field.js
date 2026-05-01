"use client";

import { useRef } from "react";

export function RichTextField({ defaultValue = "", name, label, minHeight = "160px" }) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);

  function syncValue() {
    if (!editorRef.current || !inputRef.current) {
      return;
    }

    inputRef.current.value = editorRef.current.innerHTML;
  }

  function applyCommand(command) {
    document.execCommand(command);
    syncValue();
    editorRef.current?.focus();
  }

  return (
    <div className="nfh-stack">
      <span className="nfh-eyebrow">{label}</span>
      <div className="flex flex-wrap gap-[10px]">
        {[
          ["bold", "Bold"],
          ["italic", "Italic"],
          ["insertUnorderedList", "List"],
        ].map(([command, buttonLabel]) => (
          <button
            key={command}
            className="nfh-chip"
            onClick={(event) => {
              event.preventDefault();
              applyCommand(command);
            }}
            type="button"
          >
            {buttonLabel}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="nfh-textarea outline-none focus:ring-2 focus:ring-accent"
        contentEditable
        dangerouslySetInnerHTML={{ __html: defaultValue }}
        onBlur={syncValue}
        onInput={syncValue}
        style={{ minHeight }}
        suppressContentEditableWarning
      />
      <input ref={inputRef} defaultValue={defaultValue} name={name} type="hidden" />
    </div>
  );
}
