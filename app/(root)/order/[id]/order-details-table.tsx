"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useTransition } from "react";
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateOrderToPaidCOD,
} from "@/lib/actions/order.action";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


// Shows loading or error text while the PayPal SDK loads
function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  let status = "";

  if (isPending) {
    status = "Loading PayPal...";
  } else if (isRejected) {
    status = "Error loading PayPal";
  }

  return <>{status}</>;
}

// Admin button: run an order action and show the result as a toast
function AdminOrderButton({
  orderId,
  action,
  label,
}: {
  orderId: string;
  action: (orderId: string) => Promise<{ success: boolean; message: string }>;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      className="w-full"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await action(orderId);
          toast.add({
            type: res.success ? "success" : "error",
            title: res.success ? "Success" : "Error",
            description: res.message,
          });
        })
      }
    >
      {isPending ? "Processing..." : label}
    </Button>
  );
}

// Button to mark order as paid (cash on delivery)
const MarkAsPaidButton = ({ orderId }: { orderId: string }) => (
  <AdminOrderButton orderId={orderId} action={updateOrderToPaidCOD} label="Mark As Paid" />
);

// Button to mark order as delivered
const MarkAsDeliveredButton = ({ orderId }: { orderId: string }) => (
  <AdminOrderButton orderId={orderId} action={deliverOrder} label="Mark As Delivered" />
);

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
}) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  const router = useRouter();

  // Create the PayPal order and give PayPal's order ID to the button
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast.add({
        type: "error",
        title: "Error",
        description: res.message,
      });
    }

    return res.data as string;
  };

  // Capture the payment after the customer approves it in PayPal
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);

    toast.add({
      type: res.success ? "success" : "error",
      title: res.success ? "Success" : "Error",
      description: res.message,
    });

    if (res.success) router.refresh();
  };

  // PayPal SDK failed (popup error, network, etc.)
  const handlePayPalError = (err: Record<string, unknown>) => {
    toast.add({
      type: "error",
      title: "PayPal error",
      description: String(err?.message ?? "Payment could not be completed"),
    });
  };

  // Customer closed the PayPal popup before paying
  const handlePayPalCancel = () => {
    toast.add({
      type: "error",
      title: "Payment cancelled",
      description: "Your order has not been paid",
    });
  };

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          {/* Payment method */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}{" "}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
            </CardContent>
          </Card>

          {/* Order items */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column: PayPal buttons (price summary comes later) */}
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                      onError={handlePayPalError}
                      onCancel={handlePayPalCancel}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Cash on delivery (admin) */}
              {isAdmin && !isPaid && paymentMethod === "Cash on Delivery" && (
                <MarkAsPaidButton orderId={id} />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton orderId={id} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
