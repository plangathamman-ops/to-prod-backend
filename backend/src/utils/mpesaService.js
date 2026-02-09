const axios = require('axios');
const config = require('../config/config');

class MpesaService {
  constructor() {
    this.auth = null;
    this.authExpiry = null;
  }

  // Get OAuth token
  async getAccessToken() {
    // Check if we have a valid cached token
    if (this.auth && this.authExpiry && Date.now() < this.authExpiry) {
      return this.auth;
    }

    try {
      const auth = Buffer.from(
        `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${config.mpesa.apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      this.auth = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      this.authExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      
      return this.auth;
    } catch (error) {
      console.error('M-Pesa Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  // Generate timestamp
  getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Generate password
  generatePassword(timestamp) {
    const data = config.mpesa.businessShortCode + config.mpesa.passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  // Initiate STK Push
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      // Remove any leading '+' or spaces from phone number
      const formattedPhone = phoneNumber.replace(/[^\d]/g, '');
      
      // Ensure phone starts with 254
      const phone = formattedPhone.startsWith('254') 
        ? formattedPhone 
        : `254${formattedPhone.slice(-9)}`;

      const requestData = {
        BusinessShortCode: config.mpesa.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount), // Ensure amount is integer
        PartyA: phone,
        PartyB: config.mpesa.businessShortCode,
        PhoneNumber: phone,
        CallBackURL: config.mpesa.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || 'Application Fee Payment'
      };

      const response = await axios.post(
        `${config.mpesa.apiUrl}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.errorMessage || 
        'Failed to initiate payment. Please try again.'
      );
    }
  }

  // Query STK Push status
  async querySTKPushStatus(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await axios.post(
        `${config.mpesa.apiUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: config.mpesa.businessShortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        success: response.data.ResultCode === '0'
      };
    } catch (error) {
      console.error('M-Pesa Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }
}

module.exports = new MpesaService();
