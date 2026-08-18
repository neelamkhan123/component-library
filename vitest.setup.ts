// jsdom doesn't implement `<dialog>`'s `showModal()`/`close()` (tracked
// upstream as jsdom/jsdom#3294) even though it does support the reflected
// `open` attribute — so every component built on a native `<dialog>`
// (Dialog, Drawer) needs this polyfill to be testable under jsdom at all.
// Centralized here rather than duplicated per test file since any future
// dialog-based component would otherwise hit the exact same gap.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, returnValue?: string) {
    const wasOpen = this.open;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    if (wasOpen) this.dispatchEvent(new Event("close"));
  };
}
