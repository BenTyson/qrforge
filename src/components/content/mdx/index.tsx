import { Callout } from './Callout';
import { ArticleCTA } from '../ArticleCTA';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Link as LinkIcon } from 'lucide-react';

export const mdxComponents = {
  // Override default elements
  h1: ({ children, className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={id}
      className={cn('text-3xl font-bold mt-8 mb-4 gradient-text group', className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className={cn('text-2xl font-semibold mt-12 mb-4 scroll-mt-24 group flex items-center gap-3', className)}
      {...props}
    >
      <span className="w-1 h-6 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-primary"
          aria-label={`Link to ${children}`}
        >
          <LinkIcon className="w-4 h-4" />
        </a>
      )}
    </h2>
  ),
  h3: ({ children, className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className={cn('text-xl font-semibold mt-10 mb-3 scroll-mt-24 text-slate-200 group', className)}
      {...props}
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-primary ml-2"
          aria-label={`Link to ${children}`}
        >
          <LinkIcon className="w-3.5 h-3.5 inline" />
        </a>
      )}
    </h3>
  ),
  h4: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('text-lg font-semibold mt-8 mb-2 text-slate-300', className)} {...props}>
      {children}
    </h4>
  ),
  p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-slate-400 leading-relaxed mb-5', className)} {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith('http');
    const linkClass = cn(
      'text-primary font-medium transition-all',
      'hover:text-cyan-400',
      'border-b border-primary/30 hover:border-primary',
      className
    );

    if (isExternal) {
      return (
        <a
          href={href}
          className={linkClass}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href || '#'} className={linkClass} {...props}>
        {children}
      </Link>
    );
  },
  ul: ({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('pl-6 mb-5 space-y-2 text-slate-400', className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('pl-6 mb-5 space-y-2 text-slate-400 list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('relative pl-2', className)} {...props}>
      <span className="absolute -left-4 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
      {children}
    </li>
  ),
  blockquote: ({ children, className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'relative my-6 pl-6 py-4 pr-4',
        'border-l-2 border-primary',
        'bg-slate-800/50 backdrop-blur-sm rounded-r-xl',
        'italic text-slate-300',
        className
      )}
      {...props}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded-md',
        'bg-slate-700/50 text-cyan-400',
        'text-sm font-mono',
        'border border-slate-600/30',
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'rounded-2xl p-5 my-6 overflow-x-auto',
        'bg-slate-900/80 backdrop-blur-sm',
        'border border-slate-700/50',
        'text-sm font-mono',
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (typeof src !== 'string') return null;
    return (
      <figure className="my-8">
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl shadow-black/20">
          <Image
            src={src}
            alt={alt || ''}
            width={800}
            height={450}
            className="w-full"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
          />
        </div>
        {alt && (
          <figcaption className="mt-3 text-center text-sm text-slate-500 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  table: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <table className={cn('w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn('bg-slate-800/50 border-b border-slate-700/50', className)} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('px-5 py-3.5 text-left font-semibold text-slate-200', className)} {...props}>
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('px-5 py-3.5 border-t border-slate-700/30 text-slate-400', className)} {...props}>
      {children}
    </td>
  ),
  tr: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('hover:bg-slate-700/20 transition-colors', className)} {...props}>
      {children}
    </tr>
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className={cn('my-12 border-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent', className)}
      {...props}
    />
  ),
  strong: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn('font-semibold text-white', className)} {...props}>
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className={cn('italic text-slate-300', className)} {...props}>
      {children}
    </em>
  ),
  // Custom components
  Callout,
  ArticleCTA,
};
