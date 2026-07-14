// Handles the "Install app" button: native prompt on supported browsers,
// and manual instructions on iOS Safari (which has no beforeinstallprompt).

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const isIosDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect touch to disambiguate.
  const isIpadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return isIosDevice || isIpadOs;
}

export function setupInstall(): void {
  const installButton = document.getElementById("install-button");
  const iosModal = document.getElementById("ios-install-modal");
  const iosClose = document.getElementById("ios-install-close");

  if (!installButton) return;

  const showButton = () => {
    installButton.classList.remove("hidden");
    installButton.classList.add("flex");
  };
  const hideButton = () => {
    installButton.classList.add("hidden");
    installButton.classList.remove("flex");
  };

  // Already installed / running as an app: nothing to do.
  if (isStandalone()) {
    hideButton();
    return;
  }

  // Chromium-based browsers fire this when the app is installable.
  window.addEventListener("beforeinstallprompt", (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    showButton();
  });

  // iOS has no install prompt event, so surface the button + instructions.
  if (isIos()) {
    showButton();
  }

  const openIosModal = () => {
    iosModal?.classList.remove("hidden");
    iosModal?.classList.add("flex");
  };
  const closeIosModal = () => {
    iosModal?.classList.add("hidden");
    iosModal?.classList.remove("flex");
  };

  const triggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        hideButton();
      }
      deferredPrompt = null;
      return;
    }

    if (isIos()) {
      openIosModal();
    }
  };

  // The game attaches window-level touch handlers that call preventDefault(),
  // which cancels the synthesized "click" on touch devices. Like the game's
  // other on-screen buttons, handle touchstart explicitly and stop it from
  // bubbling to those listeners.
  installButton.addEventListener("click", triggerInstall);
  installButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerInstall();
  });

  iosClose?.addEventListener("click", closeIosModal);
  iosClose?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeIosModal();
  });

  window.addEventListener("appinstalled", () => {
    hideButton();
    deferredPrompt = null;
  });
}
