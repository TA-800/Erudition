import React from "react";
import MiniThread from "./MiniThread";

export default function MegaThread({ selectedDiscussion, retrieveThread }) {
    const allProps = { ...selectedDiscussion.discussion, hoverable: false, retrieveThread: retrieveThread };

    return (
        <>
            <MiniThread {...allProps} />
            <div className="h-96 bg-cyan-800 text-cyan-100 border-2 border-cyan-900 rounded-md">
                {selectedDiscussion.comments.map((comment) => (
                    <p key={comment.id}>{comment.comment_text}</p>
                ))}
            </div>
        </>
    );
}
