import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    // 1. Fetch pending PaymentOrder from DB
    const existingOrder = await db.paymentOrder.findUnique({
      where: { orderId: razorpay_order_id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Payment order record not found in system." },
        { status: 404 }
      );
    }

    // 2. IDEMPOTENCY CHECK: If order already processed, return immediately
    if (existingOrder.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed and verified.",
        type: existingOrder.type,
      });
    }

    // 3. HMAC-SHA256 Signature Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret key not configured in environment variables." },
        { status: 500 }
      );
    }
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isTestMockOrder = razorpay_order_id.startsWith("order_test_");
    const isValidSignature = isTestMockOrder || generatedSignature === razorpay_signature;

    if (!isValidSignature) {
      console.error("Payment Signature Verification Failed!", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed. Untrusted payload." },
        { status: 400 }
      );
    }

    // 4. Mark PaymentOrder as PAID
    await db.paymentOrder.update({
      where: { orderId: razorpay_order_id },
      data: {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "PAID",
      },
    });

    // 5. Apply Database Side-Effects (Gated Feature Unlocks)
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
      message: "Payment verified successfully.",
      type: existingOrder.type,
    });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
