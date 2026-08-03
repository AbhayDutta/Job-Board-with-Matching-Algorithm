import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to upgrade." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, jobId } = body; // type: "PREMIUM_JOB" | "RECRUITER_PLAN"

    if (!type || !["PREMIUM_JOB", "RECRUITER_PLAN"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment type specified." },
        { status: 400 }
      );
    }

    // Determine pricing in paise (INR)
    let amount = 199900; // Recruiter plan: ₹1,999
    if (type === "PREMIUM_JOB") {
      amount = 49900; // Premium job boost: ₹499
      if (!jobId) {
        return NextResponse.json(
          { success: false, error: "Job ID required for premium boost." },
          { status: 400 }
        );
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay API credentials not configured in environment variables." },
        { status: 500 }
      );
    }

    let orderId: string;

    try {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          userId: session.user.id,
          type,
          jobId: jobId || "",
        },
      };

      const order = await instance.orders.create(options);
      orderId = order.id;
    } catch (razorpayErr) {
      console.warn("Razorpay API call failed or in test mock mode. Generating test order ID:", razorpayErr);
      orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Save pending PaymentOrder in DB for idempotency & security tracking
    await db.paymentOrder.create({
      data: {
        orderId,
        userId: session.user.id,
        jobId: jobId || null,
        type,
        amount,
        currency: "INR",
        status: "CREATED",
      },
    });

    const isTestMode = keyId.startsWith("rzp_test_");

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      notes: { type, jobId, isTestMode },
    });
  } catch (error: any) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize payment order." },
      { status: 500 }
    );
  }
}
