import clsx from 'clsx';

export function Input({
  className = '',
  type,
  variant,
  error,
  errorId,
  describedBy,
  required,
  ...props
}: {
  className?: string;
  type?: string;
  variant: 'search' | 'minisearch';
  error?: string;
  errorId?: string;
  describedBy?: string;
  required?: boolean;
  [key: string]: any;
}) {
  const variants = {
    search:
      'bg-transparent px-0 py-2 text-heading w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-primary/10 focus:border-primary/90',
    minisearch:
      'bg-transparent hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit',
  };

  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';
  const styles = clsx(variants[variant], errorStyles, className);

  const ariaDescribedBy =
    [errorId, describedBy].filter(Boolean).join(' ') || undefined;

  return (
    <>
      <input
        type={type}
        {...props}
        className={styles}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
      />
      {error && errorId && (
        <span id={errorId} className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
