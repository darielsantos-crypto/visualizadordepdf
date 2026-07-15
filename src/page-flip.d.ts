declare module 'page-flip' {
  export interface PageFlipOptions {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    mobileScrollSupport?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    drawShadow?: boolean;
    autoSize?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface FlipEvent {
    data: number;
  }

  export default class PageFlip {
    constructor(element: HTMLElement, options: PageFlipOptions);
    loadFromHTML(elements: NodeListOf<Element>): void;
    on(event: 'flip' | 'changeOrientation' | 'changeState', cb: (e: FlipEvent) => void): void;
    turnToPage(index: number): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    update(): void;
    destroy(): void;
  }
}
