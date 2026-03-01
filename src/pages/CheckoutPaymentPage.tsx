import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Clock, ExternalLink, QrCode, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { fetchPaymentStatus } from "@/lib/paymentApi";
import type { CheckoutResponse, PaymentStatusResponse } from "@/lib/writeApi";
import { useCart } from "@/contexts/CartContext";

interface LocationState {
  payment?: CheckoutResponse;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function CheckoutPaymentPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const didNavigateRef = useRef(false);

  const state = (location.state as LocationState | null) ?? null;
  const checkoutPayment = state?.payment;
  const fibSession = checkoutPayment?.fib;

  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());

  const validUntil = status?.validUntil ?? fibSession?.validUntil ?? null;
  const remainingMs = useMemo(() => {
    if (!validUntil) return 0;
    return Math.max(0, Date.parse(validUntil) - nowTs);
  }, [validUntil, nowTs]);

  const countdown = formatCountdown(remainingMs);

  const refresh = async () => {
    if (!orderId) return;

    setIsRefreshing(true);
    setError(null);

    const result = await fetchPaymentStatus({ orderId });
    setIsRefreshing(false);

    if (!result.ok) {
      setError(result.failure?.message ?? "Could not refresh payment status.");
      return;
    }

    setStatus(result.data);
  };

  useEffect(() => {
    void refresh();
    const pollId = window.setInterval(() => {
      void refresh();
    }, 10_000);

    return () => window.clearInterval(pollId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (remainingMs !== 0) return;
    if (status?.terminal) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, status?.terminal]);

  useEffect(() => {
    if (!status || didNavigateRef.current) return;

    if (status.paymentState === "paid") {
      didNavigateRef.current = true;
      clearCart();
      navigate("/order-confirmation", {
        replace: true,
        state: {
          order: {
            orderId,
            orderNumber: checkoutPayment?.orderNumber ?? orderId,
            paymentMethod: "fib",
            paymentState: "paid",
          },
        },
      });
    }
  }, [status, clearCart, navigate, orderId, checkoutPayment?.orderNumber]);

  const isTerminalFailure =
    status?.paymentState === "payment_failed" ||
    status?.paymentState === "payment_expired" ||
    status?.paymentState === "payment_cancelled";

  if (!orderId) {
    return (
      <Layout>
        <div className="container py-12 max-w-2xl">
          <h1 className="text-2xl font-bold">Payment Session Not Found</h1>
          <p className="text-muted-foreground mt-2">Missing order identifier for payment status tracking.</p>
          <Button asChild className="mt-4">
            <Link to="/checkout">Return to checkout</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Complete Your FIB Payment</h1>
          <p className="text-muted-foreground">Order ID: {orderId}</p>
        </div>

        <section className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Payment expires in {countdown}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={isRefreshing}>
              <RefreshCw className="w-4 h-4 mr-1" />
              {isRefreshing ? "Refreshing" : "Refresh status"}
            </Button>
          </div>

          {status && (
            <p className="text-sm text-muted-foreground">
              Current status: <span className="font-medium text-foreground">{status.paymentState}</span>
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {isTerminalFailure && (
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-sm">
              Payment ended with state <span className="font-semibold">{status?.paymentState}</span>. You can retry checkout or choose COD.
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">Pay from the FIB app</h2>
          <div className="flex flex-wrap gap-2">
            {fibSession?.businessAppLink && (
              <Button asChild>
                <a href={fibSession.businessAppLink} target="_blank" rel="noreferrer">
                  Open Business App
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            )}
            {fibSession?.corporateAppLink && (
              <Button asChild variant="outline">
                <a href={fibSession.corporateAppLink} target="_blank" rel="noreferrer">
                  Open Corporate App
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-background">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" />
              Scan QR to pay
            </div>
            {fibSession?.qrCode ? (
              <img src={fibSession.qrCode} alt="FIB payment QR" className="w-56 h-56 object-contain bg-white rounded" />
            ) : (
              <p className="text-sm text-muted-foreground">QR session is only available from the original checkout response.</p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Readable Code</p>
            <p className="font-mono text-lg">{fibSession?.readableCode ?? "Unavailable"}</p>
          </div>
        </section>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/orders">Go to orders</Link>
          </Button>
          <Button asChild>
            <Link to="/checkout">Back to checkout</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
