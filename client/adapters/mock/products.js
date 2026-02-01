/**
 * Mock 商品数据 - 来自 Razer Checkout 矿泉水产品
 * 图片已下载到本地：/static/products/
 * 注意：mock 数据只在适配层，页面不直接引用
 */

export const MOCK_PRODUCTS = [
  {
    product_id: 'prod_001',
    name: 'Spritzer Mineral Water 矿泉水',
    spec_text: '9.5L × 2 per pack',
    images: ['/static/products/spritzer-9.5l.webp'],
    origin_price: 25.98,
    sale_price: 24.68,
    status: 'on',
    description: 'Spritzer Natural Mineral Water, from a 390-acre rainforest in Taiping, Perak, is Malaysia\'s No.1 brand. Bottled at the source and rich in minerals, it delivers clean, healthy, and refreshing water in every sip.',
    stock_mode: 'none',
    stock_qty: null,
    warehouse_id: null
  },
  {
    product_id: 'prod_002',
    name: 'ICE MOUNTAIN MINERAL WATER',
    spec_text: '1500ml × 12 bottles',
    images: ['/static/products/ice-mountain-1500ml.webp'],
    origin_price: 20.90,
    sale_price: 19.85,
    status: 'on',
    description: 'Brand: ICE MOUNTAIN. Type: Mineral Water. Volume: 1500 ml per bottle. Quantity: 1 full pack of 12 bottles. Expiry: More than 15 months.',
    stock_mode: 'none',
    stock_qty: null,
    warehouse_id: null
  },
  {
    product_id: 'prod_003',
    name: 'SPRINGFRESH Mineral Water',
    spec_text: '9.5L × 2 per pack',
    images: ['/static/products/springfresh-9.5l.webp'],
    origin_price: 20.90,
    sale_price: 19.85,
    status: 'on',
    description: 'Brand: SPRINGFRESH. Type: Mineral Water. Volume: 9.5L per bottle. Quantity: 1 pack, 2 bottles. Expiry: More than 15 months.',
    stock_mode: 'none',
    stock_qty: null,
    warehouse_id: null
  },
  {
    product_id: 'prod_004',
    name: 'Jantzen Mineral Water',
    spec_text: '1.5L × 12 bottles',
    images: ['/static/products/jantzen-1.5l.webp'],
    origin_price: 20.90,
    sale_price: 19.85,
    status: 'on',
    description: 'Jantzen Mineral Water comes in a size perfect for drinking throughout the day to track your daily water intake. It is also naturally rich in vitamins and minerals, promoting overall health!',
    stock_mode: 'none',
    stock_qty: null,
    warehouse_id: null
  },
  {
    product_id: 'prod_005',
    name: 'Spritzer Mineral Water (Small)',
    spec_text: '230ml × 1 bottle',
    images: ['/static/products/spritzer-230ml.webp'],
    origin_price: 0.50,
    sale_price: 0.50,
    status: 'on',
    description: 'Spritzer Mineral Water single bottle 230ML - perfect for on-the-go hydration.',
    stock_mode: 'none',
    stock_qty: null,
    warehouse_id: null
  }
]

// 促销横幅图片路径
export const PROMO_BANNER_IMAGE = '/static/products/promo-banner.webp'

export default MOCK_PRODUCTS
