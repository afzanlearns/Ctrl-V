const ESCAPE_HTML = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderMarkdown(text: string): string {
  let html = ESCAPE_HTML(text);

  // code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="rounded-md bg-black/5 dark:bg-white/10 p-3 my-2 overflow-x-auto text-[12px] leading-relaxed">$1</pre>');

  // inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-black/10 dark:bg-white/15 px-1 py-0.5 text-[12px]">$1</code>');

  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-sky-400/40 hover:decoration-sky-500 text-sky-600 dark:text-sky-400">$1</a>');

  // bare URLs
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-sky-400/40 hover:decoration-sky-500 text-sky-600 dark:text-sky-400">$1</a>');

  // unordered lists
  html = html.replace(/^[\s]*[-*+][\s]+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li.*><\/li>\n?)+/g, (match) => `<ul class="my-1 space-y-0.5">${match}</ul>`);

  // ordered lists
  html = html.replace(/^[\s]*\d+\.[\s]+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  html = html.replace(/(<li.*><\/li>\n?)+/g, (match) => `<ol class="my-1 space-y-0.5">${match}</ol>`);

  // headings
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold mt-3 mb-1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-semibold mt-4 mb-2">$1</h1>');

  // blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-gray-300 dark:border-gray-600 pl-3 italic my-1 text-gray-600 dark:text-gray-400">$1</blockquote>');

  // horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-3 border-gray-300 dark:border-gray-600" />');

  // double line breaks = paragraph
  html = html.replace(/\n\n/g, '</p><p class="my-1">');

  return `<p class="my-1">${html}</p>`;
}

export function hasMarkdown(text: string): boolean {
  const patterns = [
    /\*\*.+?\*\*/, /\*.+?\*/, /~~.+?~~/,
    /`[^`]+`/, /```[\s\S]*?```/,
    /\[.+\]\(.+\)/, /https?:\/\/\S+/,
    /^#{1,4} /m, /^[-*+]\s/m, /^\d+\.\s/m,
    /^>\s/m,
  ];
  return patterns.some((p) => p.test(text));
}
