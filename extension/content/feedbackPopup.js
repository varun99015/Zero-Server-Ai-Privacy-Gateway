function showFeedbackPopup() {

    // Prevent duplicate popup
    if (document.getElementById("zs-feedback-popup")) return;

    const popup = document.createElement("div");

    popup.id = "zs-feedback-popup";

    popup.innerHTML = `
        <div style="
            position:fixed;
            bottom:20px;
            right:20px;
            width:320px;
            background:white;
            border:1px solid #ccc;
            border-radius:10px;
            padding:16px;
            z-index:999999;
            box-shadow:0 4px 12px rgba(0,0,0,0.2);
            font-family:sans-serif;
        ">
            <h3>🔒 Privacy Gateway Feedback</h3>

            <p style="font-size:13px;">
                Please help evaluate the extension.
            </p>

            <a href="https://forms.gle/tGTgzQuRHhPP2UtA6"
               target="_blank"
               style="
                    display:inline-block;
                    margin-top:10px;
                    background:#4CAF50;
                    color:white;
                    padding:8px 14px;
                    text-decoration:none;
                    border-radius:6px;
               ">
               Give Feedback
            </a>

            <button id="close-feedback-popup"
                style="
                    margin-left:10px;
                    padding:8px 12px;
                ">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    document
        .getElementById("close-feedback-popup")
        .onclick = () => popup.remove();
}