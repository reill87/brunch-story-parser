interface PageSection {
  content: string;
  pageNumber: number;
}

export function splitContentIntoPages(htmlContent: string): PageSection[] {
  // HTML 문자열을 DOM으로 파싱
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = Array.from(doc.body.children);
  
  const pages: PageSection[] = [];
  let currentPage: string[] = [];
  let currentHeight = 0;
  const TARGET_HEIGHT = 800; // 예상 페이지 높이 (픽셀)
  
  elements.forEach((element) => {
    const elementHeight = getEstimatedHeight(element);
    
    if (currentHeight + elementHeight > TARGET_HEIGHT && currentPage.length > 0) {
      // 현재 페이지가 목표 높이를 초과하면 새 페이지 시작
      pages.push({
        content: currentPage.join(''),
        pageNumber: pages.length + 1
      });
      currentPage = [];
      currentHeight = 0;
    }
    
    currentPage.push(element.outerHTML);
    currentHeight += elementHeight;
  });
  
  // 마지막 페이지 추가
  if (currentPage.length > 0) {
    pages.push({
      content: currentPage.join(''),
      pageNumber: pages.length + 1
    });
  }
  
  return pages;
}

function getEstimatedHeight(element: Element): number {
  // 요소 타입별 예상 높이 계산
  const tag = element.tagName.toLowerCase();
  const text = element.textContent || '';
  const wordCount = text.split(/\s+/).length;
  
  const heightEstimates: Record<string, number> = {
    h1: 60,
    h2: 50,
    h3: 40,
    p: Math.ceil(wordCount / 10) * 24, // 한 줄당 약 10단어, 줄 높이 24px
    figure: 300, // 이미지 요소 예상 높이
    blockquote: Math.ceil(wordCount / 8) * 28,
  };
  
  return heightEstimates[tag] || 30;
} 