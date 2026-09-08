"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useRouter } from "next/router";
import { PAGE_PATHS } from "@/lib/auth";
const PersonasUIContext = createContext(null);
function usePersonasUI() {
  const ctx = useContext(PersonasUIContext);
  if (!ctx) throw new Error("usePersonasUI must be used within PersonasUIProvider");
  return ctx;
}
function PersonasUIProvider({ children }) {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [modal, setModal] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastVisible(true);
  }, []);
  useEffect(() => {
    if (!toastVisible) return;
    const id = window.setTimeout(() => setToastVisible(false), 3e3);
    return () => window.clearTimeout(id);
  }, [toastVisible, toast]);
  const closeModal = useCallback(() => setModal(null), []);
  const navigateTo = useCallback(
    (page, opts = {}) => {
      const valid = ["control-tower", "operations", "process"];
      if (!valid.includes(page)) {
        showToast("This section is coming soon. Try Control Tower, Operations, or Process Details.");
        return;
      }
      const persona = page;
      const params = new URLSearchParams();
      if (opts.warehouse) params.set("warehouse", opts.warehouse);
      if (opts.process) params.set("process", opts.process);
      const qs = params.toString();
      const path = PAGE_PATHS[persona] + (qs ? `?${qs}` : "");
      router.push(path);
      const labels = {
        "control-tower": "Control Tower",
        operations: "Operations",
        process: "Process Details"
      };
      if (!opts.silent) {
        showToast(
          `Opened: ${labels[persona]}${opts.warehouse ? ` \u2192 ${opts.warehouse}` : ""}${opts.process ? ` \u2192 ${opts.process}` : ""}`
        );
      }
    },
    [router, showToast]
  );
  const showModal = useCallback(
    (title, body, navTarget, navOpts) => {
      setModal({ title, body, navTarget, navOpts });
    },
    []
  );
  const value = useMemo(
    () => ({ showToast, showModal, closeModal, navigateTo }),
    [showToast, showModal, closeModal, navigateTo]
  );
  return <PersonasUIContext.Provider value={value}>
      {children}
      <div className={`toast${toastVisible ? " show" : ""}`} id="toast">
        {toast}
      </div>
      <div
    className={`modal-overlay${modal ? " show" : ""}`}
    id="modal"
    onClick={(e) => {
      if (e.target === e.currentTarget) closeModal();
    }}
  >
        {modal ? <div className="modal">
            <h3>{modal.title}</h3>
            <p>{modal.body}</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn secondary" onClick={closeModal}>
                Close
              </button>
              {modal.navTarget ? <button
    type="button"
    className="modal-btn primary"
    onClick={() => {
      navigateTo(modal.navTarget, {
        process: "Robo Sorting",
        warehouse: "TECHNO",
        ...modal.navOpts
      });
      closeModal();
    }}
  >
                  Go to{" "}
                  {modal.navTarget === "operations" ? "Operations" : modal.navTarget === "process" ? "Process Details" : "Control Tower"}
                </button> : null}
            </div>
          </div> : null}
      </div>
    </PersonasUIContext.Provider>;
}
export {
  PersonasUIProvider,
  usePersonasUI
};
