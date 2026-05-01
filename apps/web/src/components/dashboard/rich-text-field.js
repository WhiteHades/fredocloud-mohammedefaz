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
    <div className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
      <span>{label}</span>
      <div className="flex flex-wrap gap-2">
        {[
          ["bold", "Bold"],
          ["italic", "Italic"],
          ["insertUnorderedList", "List"],
        ].map(([command, buttonLabel]) => (
          <button
            key={command}
            className="min-h-[36px] border border-stone-300 px-3 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-stone-900 hover:text-stone-50 dark:border-stone-700 dark:hover:bg-stone-50 dark:hover:text-stone-950"
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
        className="border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
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
