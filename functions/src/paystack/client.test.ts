import { PaystackClient } from "./client";
import axios from "axios";
import * as sinon from "sinon";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("PaystackClient", () => {
  const secret = "your-secret-key";
  const client = new PaystackClient(secret);
  let axiosRequestStub: sinon.SinonStub;

  beforeEach(() => {
    axiosRequestStub = sinon.stub(axios, "request");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("initializeTransaction", () => {
    it("should send a POST request to the correct URL with the provided data", async () => {
      const request = {
        amount: 100,
        email: "jasonsbrown25@gmail.com",
        currency: "ZAR"
      };
      const expectedResponse = {
        
      };

      axiosRequestStub.resolves({ data: expectedResponse });

      const response = await client.initializeTransaction(request);

      expect(
        axiosRequestStub.calledWith({
          url: "https://api.paystack.co/transaction/initialize",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${secret}`,
          },
          data: request,
        })
      ).to.be.true;

      expect(response).to.eql(expectedResponse);
    });

    it("should throw an error if the response status is not in the 200-399 range", async () => {
      const request = {
        amount: 100,
        email: "jasonsbrown25@gmail.com",
        currency: "ZAR",
      };
      const errorResponse = { status: 400, message: "Bad Request" };

      axiosRequestStub.resolves({ status: 400, data: errorResponse });

      await expect(client.initializeTransaction(request)).to.be.rejectedWith(
        "400: Bad Request"
      );
    });
  });
});
