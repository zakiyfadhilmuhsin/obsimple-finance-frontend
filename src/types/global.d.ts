/// <reference types="react" />
/// <reference types="react-dom" />

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes, LabelHTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // HTML Elements
      div: HTMLAttributes<HTMLDivElement>;
      span: HTMLAttributes<HTMLSpanElement>;
      p: HTMLAttributes<HTMLParagraphElement>;
      h1: HTMLAttributes<HTMLHeadingElement>;
      h2: HTMLAttributes<HTMLHeadingElement>;
      h3: HTMLAttributes<HTMLHeadingElement>;
      h4: HTMLAttributes<HTMLHeadingElement>;
      h5: HTMLAttributes<HTMLHeadingElement>;
      h6: HTMLAttributes<HTMLHeadingElement>;
      button: ButtonHTMLAttributes<HTMLButtonElement>;
      input: InputHTMLAttributes<HTMLInputElement>;
      textarea: HTMLAttributes<HTMLTextAreaElement>;
      form: FormHTMLAttributes<HTMLFormElement>;
      label: LabelHTMLAttributes<HTMLLabelElement>;
      select: HTMLAttributes<HTMLSelectElement>;
      option: HTMLAttributes<HTMLOptionElement>;
      
      // Table elements
      table: HTMLAttributes<HTMLTableElement>;
      thead: HTMLAttributes<HTMLTableSectionElement>;
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      tr: HTMLAttributes<HTMLTableRowElement>;
      th: HTMLAttributes<HTMLTableCellElement>;
      td: HTMLAttributes<HTMLTableCellElement>;
      caption: HTMLAttributes<HTMLTableCaptionElement>;
      
      // List elements
      ul: HTMLAttributes<HTMLUListElement>;
      ol: HTMLAttributes<HTMLOListElement>;
      li: HTMLAttributes<HTMLLIElement>;
      
      // Media elements
      img: HTMLAttributes<HTMLImageElement> & {
        src: string;
        alt: string;
        width?: number | string;
        height?: number | string;
      };
      
      // Navigation elements
      nav: HTMLAttributes<HTMLElement>;
      a: HTMLAttributes<HTMLAnchorElement> & {
        href?: string;
        target?: string;
        rel?: string;
      };
      
      // Semantic elements
      header: HTMLAttributes<HTMLElement>;
      footer: HTMLAttributes<HTMLElement>;
      main: HTMLAttributes<HTMLElement>;
      section: HTMLAttributes<HTMLElement>;
      article: HTMLAttributes<HTMLElement>;
      aside: HTMLAttributes<HTMLElement>;
    }
  }
}