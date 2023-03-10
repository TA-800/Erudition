import React, { useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function Texteditor({ initial, qref }) {
    const editorWrapper = useCallback((wrapper) => {
        // If for some reason the wrapper is null, return
        if (wrapper == null) return;

        // Clear the wrapper
        wrapper.innerHTML = "";
        // Create a div to hold the editor
        const editor = document.createElement("div");
        wrapper.append(editor);
        // Instantiate the Quill editor into the editor div
        const quillInstance = new Quill(editor, { theme: "snow", placeholder: "Start writing here" });
        // Set the initial value of the editor
        try {
            quillInstance.setContents(JSON.parse(initial).ops);
        } catch (e) {
            quillInstance.setContents([{ insert: "\n" }]);
        }

        // Set the reference to the Quill instance for use in other components
        qref.current = quillInstance;
    }, []);

    return (
        <div className="editorWrapper" ref={editorWrapper}>
            {/* Quill editor will be rendered here */}
        </div>
    );
}
