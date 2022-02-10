import React, { useCallback, useEffect, useRef, useState } from "react";
import { getContentHeight, htmlToSlate, SlateEditor, slateToHtml, SlateToolbar } from "@concord-consortium/slate-editor";

import "@concord-consortium/slate-editor/build/index.css";
import "./rich-text-widget.css";

const kThemeColor = "#34a5be";

interface IRichTextProps {
  id: string;
  onBlur:  (id: string, value:string) => void;
  value: string;
}

function exportHtml(value: any) {
  const html = slateToHtml(value);
  // convert empty paragraph to empty string
  const emptyParagraphsRegex = /<p>\s*<\/p>/gi;
  const cleanedHTML = html.replace(emptyParagraphsRegex, "");
  return cleanedHTML;
}

export const RichTextWidget = (props: IRichTextProps) => {
  const { id, onBlur } = props;
  const [value, setValue] = useState(htmlToSlate(props.value || ""));
  const [changeCount, setChangeCount] = useState(0);
  const editorRef = useRef<any>();
  const kExtraHeight = 30;
  const kInitialHeight = 50;
  const [height, setHeight] = useState(kInitialHeight);


  const handleEditorRef = useCallback((editor: any | null) => {
    editorRef.current = editor || undefined;
    if (editor) {
      // associate label with edit field
      (editor as any).el.id = id;
    }
  }, [id]);

  const handleChange = (editorValue: any) => {
    setValue(editorValue);
    setChangeCount(count => count + 1);
  };

  const handleBlur = () => {
    onBlur(id, exportHtml(value));
  };

  // dynamically resize editor to fit content
  useEffect(() => {
    if (editorRef.current) {
      const currentHeight: number | undefined = getContentHeight(editorRef.current);
      const desiredHeight = currentHeight ? currentHeight + kExtraHeight : kInitialHeight;
      if (desiredHeight !== height) {
        setHeight(desiredHeight);
      }
    }
  }, [changeCount, value, height]);

  useEffect(() => {
    setValue(htmlToSlate(props.value || ""));
  }, [props.value]);
  return (
    <div className="customRichTextWidget">
      <SlateToolbar
        colors={{
          buttonColors: { fill: "#666666", background: "#FFFFFF" },
          selectedColors: { fill: "#FFFFFF", background: "#666666" },
          themeColor: kThemeColor }}
        order={["bold", "italic", "underlined", "deleted", "superscript", "subscript", "color",
                "image", "link",
                "heading1", "heading2", "heading3", "block-quote", "ordered-list", "bulleted-list"]}
        padding={2}
        editor={editorRef.current}
        changeCount={changeCount}
        />
      <div className="form-control" style={{ height }}>
        <SlateEditor
          className="customRichTextEditor"
          value={value}
          onEditorRef={handleEditorRef}
          onValueChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </div>);
};