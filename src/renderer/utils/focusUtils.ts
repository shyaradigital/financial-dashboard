/**
 * Focus Management Utilities
 * Ensures inputs remain clickable and focusable throughout the application
 */

/**
 * Restore focus to an input element after async operations or dialogs
 */
export function restoreInputFocus(inputId?: string, selector?: string) {
  setTimeout(() => {
    let element: HTMLElement | null = null;
    
    if (inputId) {
      element = document.getElementById(inputId) as HTMLElement;
    } else if (selector) {
      element = document.querySelector(selector) as HTMLElement;
    } else {
      // Find first available input
      element = document.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])') as HTMLElement;
    }
    
    if (element) {
      element.focus();
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.click();
      }
    }
  }, 100);
}

/**
 * Ensure all inputs in the document are clickable
 */
export function ensureAllInputsClickable() {
  const allInputs = document.querySelectorAll('input, textarea, select');
  allInputs.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const inputEl = htmlEl as HTMLInputElement;
    
    // Only fix non-disabled, non-readonly inputs
    if (!inputEl.disabled && !inputEl.readOnly) {
      htmlEl.style.pointerEvents = 'auto';
      if (htmlEl.tagName === 'INPUT' || htmlEl.tagName === 'TEXTAREA') {
        inputEl.style.cursor = 'text';
      }
    }
  });
  
  // Ensure all buttons are clickable
  const allButtons = document.querySelectorAll('button:not([disabled])');
  allButtons.forEach((btn) => {
    (btn as HTMLElement).style.pointerEvents = 'auto';
    (btn as HTMLElement).style.cursor = 'pointer';
  });
}

/**
 * Wrapper for window.confirm that restores focus after
 */
export function confirmWithFocusRestore(message: string, inputId?: string): boolean {
  const result = window.confirm(message);
  
  if (!result) {
    restoreInputFocus(inputId);
  }
  
  // Always ensure inputs are clickable after confirm
  setTimeout(() => {
    ensureAllInputsClickable();
  }, 150);
  
  return result;
}

/**
 * Wrapper for window.alert that restores focus after
 */
export function alertWithFocusRestore(message: string, inputId?: string) {
  window.alert(message);
  restoreInputFocus(inputId);
  setTimeout(() => {
    ensureAllInputsClickable();
  }, 150);
}

