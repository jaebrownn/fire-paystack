import axios from "axios";
import {
  Response,
  InitializeTransactionRequest,
  InitializeTransactionResponse,
} from "./types";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

/**
 * This class represents a client for the Paystack API.
 */
export class PaystackClient {
  /**
   * The secret key used for authenticating with the Paystack API.
   */
  private secret: string;

  /**
   * Creates a new PaystackClient.
   * @param {string} secret - The secret key used for authenticating
   * with the Paystack API.
   */
  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Sends a request to the specified URL using the specified method.
   * @param {string} url - The URL to send the request to.
   * @param {"GET" | "POST"} method - The HTTP method to use for the request.
   * @param {any} data - The data to send with the request (optional).
   * @return {Promise<T>} - A promise that resolves to the response data.
   * @throws {Error} - If the response status is not in the 200-399 range.
   */
  private async sendRequest<T>(
    url: string,
    method: "GET" | "POST",
    data?: any
  ): Promise<T> {
    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.secret}`,
    };

    const response = await axios.request<Response<T>>({
      url: `${PAYSTACK_BASE_URL}${url}`,
      method,
      headers,
      data,
    });

    if (response.status < 200 || response.status >= 400) {
      console.log("ERROR")
      const errorResponse: Response<any> = response.data as Response<any>;
      throw new Error(`${response.status}: ${errorResponse.message}`);
    }

    return response.data.data as T;
  }

  /**
   * Initializes a transaction.
   * @param {InitializeTransactionRequest} request - The request object for
   * initializing the transaction.
   * @return {Promise<InitializeTransactionResponse>} - A promise that
   * resolves to the response object.
   */
  public async initializeTransaction(
    request: InitializeTransactionRequest
  ): Promise<InitializeTransactionResponse> {
    return await this.sendRequest<InitializeTransactionResponse>(
      "/transaction/initialize",
      "POST",
      request
    );
  }
}
