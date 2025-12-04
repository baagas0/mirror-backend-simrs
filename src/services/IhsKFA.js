const axios = require("axios");
const { get_token, token_key } = require("../helper/axios_satu_sehat");

const { createClient } = require("redis");
const client = createClient({
  url: `redis://${process.env.HOST_REDIS}:${process.env.PORT_REDIS}`,
  legacyMode: true,
});
client.connect().catch(console.error);
const { promisify } = require("util");
const { product } = require("../module/kfa/controller");
const getRedisAsync = promisify(client.get).bind(client);

const url = process.env.KFA_URL || "https://api-satusehat-stg.dto.kemkes.go.id/kfa-v2";

class KFA {
  constructor() {
    this.client = axios.create({
      baseURL: url,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((async (config) => {
      // You can modify the request config here if needed
      let token = await getRedisAsync(token_key);
      if (!token) token = await get_token();


      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    }), error => {
      return Promise.reject(error);
    });
  }

  /**
   * Get all products
   * @param {number} page - Page number (e.g., 0, 1, 2...)
   * @param {number} size - Number of results per page
   * @param {string} [productType] - Optional product type (e.g., "farmasi")
   */
  async productAll(page = 0, size = 100, productType = 'farmasi', keyword = '') {
    try {
      const params = {
        page,
        size,
        product_type: ' ',
        keyword: keyword
      };

      const { data } = await this.client.get("/products/all", { params });
      return data;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  }
}

// export default KFA;
module.exports = KFA;
