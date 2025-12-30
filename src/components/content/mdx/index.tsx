import { Callout } from './Callout';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const mdxComponents = {
  // Override default elements
  h1: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('text-3xl font-bold mt-8 mb-4 gradient-text', className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn('text-2xl font-semibold mt-10 mb-4 scroll-mt-24', className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-xl font-semibold mt-8 mb-3 scroll-mt-24', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('text-lg font-semibold mt-6 mb-2', className)} {...props}>
      {children}
    </h4>
  ),
  p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-muted-foreground leading-relaxed mb-4', className)} {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          className={cn('text-primary hover:underline', className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href || '#'} className={cn('text-primary hover:underline', className)} {...props}>
        {children}
      </Link>
    );
  },
  ul: ({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('list-disc pl-6 mb-4 space-y-2 text-muted-foreground', className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('list-decimal pl-6 mb-4 space-y-2 text-muted-foreground', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn('', className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn('border-l-4 border-primary/50 pl-4 my-6 italic text-muted-foreground', className)}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn('px-1.5 py-0.5 rounded bg-secondary text-sm font-mono', className)}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn('rounded-xl p-4 my-6 overflow-x-auto bg-[#0d1117] text-sm', className)}
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (typeof src !== 'string') return null;
    return (
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={450}
        className="rounded-xl my-6"
      />
    );
  },
  table: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className={cn('w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn('bg-secondary/50', className)} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('px-4 py-3 text-left font-semibold', className)} {...props}>
      {children}
    </th>
  ),
  td: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('px-4 py-3 border-t border-border', className)} {...props}>
      {children}
    </td>
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn('my-8 border-border', className)} {...props} />
  ),
  // Custom components
  Callout,
};
