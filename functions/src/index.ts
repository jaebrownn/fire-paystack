/*
 * This template contains a HTTP function that responds
 * with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/publishers
 */

import { PaystackClient } from "./paystack/client";
import { InitializeTransactionResponse, PaystackEvent } from "./paystack/types";

import { firestore } from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as crypto from "crypto";

initializeApp();

// Initialise variables
const secret = process.env.PAYSTACK_API_KEY || "";
const paymentsCollection = process.env.PAYMENTS_COLLECTION || "payments";
const defaultCurrency = process.env.DEFAULT_CURRENCY || "ZAR";

const paystackClient = new PaystackClient(secret);

// paymentCreated is triggers when a document is added to the payments collection.
// The information in this document is used to initialize a payment with Paystack
// and the corresponding authoization URL for the payment is written back to 
// the document
export const paymentCreated = firestore
  .document(`${paymentsCollection}/{paymentID}`)
  .onCreate(async (snapshot, context) => {
    console.log("Payment creeated");

    // In order to create a payment, we need the following information:
    // 1. The email of the buyer
    // 2. The amount of the purchase
    // 3. The currency
    const paymentDetails = snapshot.data();

    // Check that the payment has the necessary fields and initialize the transaction
    if (!paymentDetails || !paymentDetails.email || !paymentDetails.amount) {
      // Write an error to the document if there is a problem initializing the transaction
      try {
        await snapshot.ref.set(
          {
            error: "Must have email and amount set",
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to write error to payment document", error);
      }
      return;
    }

    // Create the transaction request
    const transactionRequest = {
      email: paymentDetails.email,
      amount: paymentDetails.amount * 100,
      currency: defaultCurrency,
      // The reference is the unique ID assigned to payments as tracked in your backend
      reference: context.params.paymentID,
    };

    let transactionResponse: InitializeTransactionResponse;
    try {
      // Initialize the transaction
      transactionResponse = await paystackClient.initializeTransaction(
        transactionRequest
      );
      console.log("Transaction initialized", transactionResponse);

      // Write the redirect authorization URL response data back to the payment
      // for use by clients
      await snapshot.ref.set(transactionResponse, { merge: true });
    } catch (error) {
      console.error("Failed to initialize transaction", error);
    }
  });

// handlePayment is the webhook that Paystack will send events to
// to acknowledge receirpt of payment. We will use this event
// to set the status of the payment accordingly
export const handlePayment = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
  })
  .https.onRequest(async (req, res) => {
    // Verify the origin
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash != req.headers["x-paystack-signature"]) {
      // The origin is not from Paystack, warn and return error
      console.warn("Origin is not Paystack. Denying verification");
      res.status(403).send("Access denied");
    }

    try {
      const event: PaystackEvent = req.body;

      switch (event.event) {
        case "charge.success":
          // Assuming that we store the payment details in a collection 'payments'
          // and the Paystack transaction ID is used as the document ID in Firestore
          const paymentRef = getFirestore()
            .collection(paymentsCollection)
            .doc(event.data.reference.toString());

          // Update the payment document with the successful charge details
          await paymentRef.set(
            {
              status: "successful",
              gateway_response: event.data.gateway_response,
            },
            { merge: true }
          );

          break;

        default:
          // Handle unhandled events
          console.warn("Unhandled Paystack event: ", event.event);
          break;
      }

      res.status(200).send("Event processed");
    } catch (error) {
      console.error("Error handling Paystack event: ", error);
      res.status(500).send("Internal Server Error");
    }
  });
