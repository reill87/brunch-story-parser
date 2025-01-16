interface PageSection {
  content: string;
  pageNumber: number;
}

export function splitContentIntoPages(htmlContent: string, fontSize: string): PageSection[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = Array.from(doc.body.children);
  
  const pages: PageSection[] = [];
  let currentPage: string[] = [];
  let currentHeight = 0;
  
  // 폰트 크기에 따른 높이 조정
  const fontSizeMultiplier = {
    'small': 0.9,
    'medium': 1,
    'large': 1.2,
    'xlarge': 1.4
  }[fontSize] || 1;

  const TARGET_HEIGHT = 700 * (1 / fontSizeMultiplier); // 폰트 크기에 따라 목표 높이 조정

  elements.forEach((element, index) => {
    const elementHeight = getEstimatedHeight(element, fontSize);
    const isLastElement = index === elements.length - 1;
    
    if (currentHeight + elementHeight > TARGET_HEIGHT && currentPage.length > 0) {
      pages.push({
        content: currentPage.join(''),
        pageNumber: pages.length + 1
      });
      currentPage = [];
      currentHeight = 0;
    }
    
    currentPage.push(element.outerHTML);
    currentHeight += elementHeight;
    
    if (isLastElement || currentHeight >= TARGET_HEIGHT * 0.8) {
      pages.push({
        content: currentPage.join(''),
        pageNumber: pages.length + 1
      });
      currentPage = [];
      currentHeight = 0;
    }
  });

  if (currentPage.length > 0) {
    pages.push({
      content: currentPage.join(''),
      pageNumber: pages.length + 1
    });
  }
  
  return pages;
}

function getEstimatedHeight(element: Element, fontSize: string): number {
  const tag = element.tagName.toLowerCase();
  const text = element.textContent || '';
  const wordCount = text.split(/\s+/).length;
  
  // 폰트 크기에 따른 높이 조정
  const fontSizeMultiplier = {
    'small': 0.9,
    'medium': 1,
    'large': 1.2,
    'xlarge': 1.4
  }[fontSize] || 1;

  const baseHeights: Record<string, number> = {
    h1: 80,
    h2: 60,
    h3: 50,
    p: Math.ceil(wordCount / 8) * 28,
    figure: 400,
    blockquote: Math.ceil(wordCount / 6) * 32,
    div: Math.ceil(wordCount / 8) * 28,
  };

  return (baseHeights[tag] || Math.ceil(wordCount / 8) * 28) * fontSizeMultiplier;
} 