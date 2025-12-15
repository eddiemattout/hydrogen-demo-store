import {useEffect, useRef, useCallback} from 'react';

import {IconClose} from '~/components/Icon';
import {Link} from '~/components/Link';

export function Modal({
  children,
  cancelLink,
  title,
}: {
  children: React.ReactNode;
  cancelLink: string;
  title?: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Navigate to cancel link on Escape
        window.location.href = cancelLink;
        return;
      }

      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [cancelLink],
  );

  useEffect(() => {
    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the first focusable element when modal opens
    const modal = modalRef.current;
    if (modal) {
      const firstFocusable = modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    // Add keyboard event listener for focus trap
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Return focus to the previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [handleKeyDown]);

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      id="modal-bg"
    >
      <div
        className="fixed inset-0 transition-opacity bg-opacity-75 bg-primary/40"
        aria-hidden="true"
      ></div>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div
            ref={modalRef}
            className="relative flex-1 px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded shadow-xl bg-contrast sm:my-12 sm:flex-none sm:w-full sm:max-w-sm sm:p-6"
          >
            {title && (
              <h2 id="modal-title" className="sr-only">
                {title}
              </h2>
            )}
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <Link
                to={cancelLink}
                className="p-4 -m-4 transition text-primary hover:text-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                aria-label="Close modal"
              >
                <IconClose aria-hidden="true" />
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
