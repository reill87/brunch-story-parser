interface PageSection {
  content: string;
  pageNumber: number;
}

export function splitContentIntoPages(htmlContent: string): PageSection[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = Array.from(doc.body.children);
  
  const pages: PageSection[] = [];
  let currentPage: string[] = [];
  let currentHeight = 0;
  const TARGET_HEIGHT = 700; // 여유 공간을 위해 높이를 약간 줄임
  
  elements.forEach((element, index) => {
    const elementHeight = getEstimatedHeight(element);
    const isLastElement = index === elements.length - 1;
    
    // 현재 요소를 추가했을 때 페이지 높이를 초과하는 경우
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
    
    // 마지막 요소이거나 현재 높이가 목표 높이에 가까워진 경우
    if (isLastElement || currentHeight >= TARGET_HEIGHT * 0.8) {
      pages.push({
        content: currentPage.join(''),
        pageNumber: pages.length + 1
      });
      currentPage = [];
      currentHeight = 0;
    }
  });

  // 남은 컨텐츠가 있다면 마지막 페이지로 추가
  if (currentPage.length > 0) {
    pages.push({
      content: currentPage.join(''),
      pageNumber: pages.length + 1
    });
  }
  
  return pages;
}

function getEstimatedHeight(element: Element): number {
  const tag = element.tagName.toLowerCase();
  const text = element.textContent || '';
  const wordCount = text.split(/\s+/).length;
  
  // 한글 텍스트를 고려한 높이 계산 조정
  const heightEstimates: Record<string, number> = {
    h1: 80,  // 제목 높이 증가
    h2: 60,
    h3: 50,
    p: Math.ceil(wordCount / 8) * 28,  // 한글 텍스트는 더 많은 공간 필요
    figure: 400,  // 이미지 영역 확대
    blockquote: Math.ceil(wordCount / 6) * 32,
    div: Math.ceil(wordCount / 8) * 28,
  };
  
  // 기본값 조정
  return heightEstimates[tag] || Math.ceil(wordCount / 8) * 28;
} 