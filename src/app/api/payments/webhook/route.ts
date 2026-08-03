import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: "RAZORPAY_WEBHOOK_SECRET environment variable is not configured." },
        { status: 500 }
      );
    }

    if (!razorpaySignature) {
      console.warn("No x-razorpay-signature header provided in webhook request.");
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("Razorpay Webhook Signature Mismatch!");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid events
    if (event === "payment.captured" || event === "order.paid") {
      const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
      const orderId = entity?.order_id || entity?.id;
      const paymentId = entity?.id || payload.payload?.payment?.entity?.id;

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "Missing order ID in webhook payload." },
          { status: 400 }
        );
      }

      // 2. Fetch PaymentOrder
      const existingOrder = await db.paymentOrder.findUnique({
        where: { orderId },
      });

      if (!existingOrder) {
        console.warn(`Webhook received for unknown orderId: ${orderId}`);
        return NextResponse.json({ success: true, message: "Order not found in local DB." });
      }

      // 3. IDEMPOTENCY CHECK: If already marked PAID, return 200 without duplicate updates
      if (existingOrder.status === "PAID") {
        return NextResponse.json({
          success: true,
          message: "Event already processed (idempotent response).",
        });
      }

      // 4. Update order status to PAID
      await db.paymentOrder.update({
        where: { orderId },
        data: {
          paymentId: paymentId || existingOrder.paymentId,
          status: "PAID",
        },
      });

      // 5. Apply Gated Feature Updates
      if (existingOrder.type === "PREMIUM_JOB" && existingOrder.jobId) {
        await db.job.update({
          where: { id: existingOrder.jobId },
          data: { isPremium: true },
        });
        revalidatePath("/dashboard/employer/jobs");
        revalidatePath("/dashboard/candidate/jobs");
      } else if (existingOrder.type === "RECRUITER_PLAN") {
        await db.user.update({
          where: { id: existingOrder.userId },
          data: { plan: "RECRUITER" },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Webhook processed and payment recorded successfully.",
      });
    }

    // Default response for other webhook events
    return NextResponse.json({ success: true, message: `Event ${event} acknowledged.` });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook." },
      { status: 500 }
    );
  }
}
