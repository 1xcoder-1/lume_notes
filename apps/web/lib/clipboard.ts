export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Try modern Clipboard API
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed:", err);
      // Continue to fallback
    }
  }

  // 2. Fallback to execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure it's not visible and doesn't scroll the page
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}
