/**
 * Interface for the request to initialize a transaction.
 */
export interface InitializeTransactionRequest {
  amount: number, // The amount for the transaction
  email: string, // The email of the user initiating the transaction
  currency: string, // The currency for the transaction
  reference?: string, // Optional reference for the transaction
  callback_url?: string, // Optional callback URL for the transaction
}

/**
 * Interface for the response after initializing a transaction.
 */
export interface InitializeTransactionResponse {
  authorization_url: string; // The authorization URL for the transaction
  access_code: string; // The access code for the transaction
  reference: string; // The reference for the transaction
}

export interface PaystackEventData {
  id: number;
  reference: string;
  gateway_response: string;
}

export interface PaystackEvent {
  event: string;
  data: PaystackEventData;
}

/**
 * Interface for the response from the Paystack API.
 */
export interface Response<T> {
  status: boolean; // The status of the response
  message: string; // The message from the response
  data: T; // The data from the response
}
