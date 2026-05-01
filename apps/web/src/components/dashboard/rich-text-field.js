"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextB, TextItalic, ListBullets } from "@phosphor-icons/react";

export function RichTextField({ defaultValue, name, label, minHeight = "160px" }) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);

  function syncValue() {
    if (inputRef.current && editorRef.current) {
      inputRef.current.value = editorRef.current.innerHTML;
    }
  }

  function execCommand(command, value) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncValue();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 rounded-t-lg border border-b-0 bg-muted/50 p-1">
        <Button variant="ghost" size="icon-sm" onClick={() => execCommand("bold")} title="Bold">
          <TextB />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => execCommand("italic")} title="Italic">
          <TextItalic />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => execCommand("insertUnorderedList")} title="List">
          <ListBullets />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[160px] rounded-b-lg border border-t-0 bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ minHeight }}
        onInput={syncValue}
        onBlur={syncValue}
        dangerouslySetInnerHTML={{ __html: defaultValue || "" }}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue || ""} />
    </div>
  );
}
