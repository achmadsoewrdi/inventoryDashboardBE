// ─────────────────────────────────────────
// SHARED PROPERTIES
// ─────────────────────────────────────────

const productProperties = {
  id: { type: 'number' },
  name: { type: 'string' },
  sku: { type: 'string' },
  description: { type: 'string', nullable: true },
  basePrice: { type: 'number' },
  salePrice: { type: 'number' },
  currentStock: { type: 'number' },
  stockThreshold: { type: 'number' },
  status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] },
  category: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      subCategory: { type: 'string' },
    }
  },
  supplier: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
    }
  },
  images: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        url: { type: 'string' },
        isPrimary: { type: 'boolean' },
      }
    }
  },
  location: {
    type: 'object',
    nullable: true,
    properties: {
      aisle: { type: 'string' },
      shelf: { type: 'string' },
      warehouse: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        }
      }
    }
  },
  updatedAt: { type: 'string' },
  createdAt: { type: 'string' },
}

// ─────────────────────────────────────────
// GET ALL PRODUCTS
// ─────────────────────────────────────────

export const getProductsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 25 },
      search: { type: 'string' },
      categoryId: { type: 'number' },
      warehouseId: { type: 'number' },
      status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] },
      tab: { type: 'string', enum: ['all', 'low_stock', 'out'] },
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object', properties: productProperties }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          }
        }
      }
    }
  }
}

// ─────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────

export const getProductByIdSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } }
  },
  response: {
    200: { type: 'object', properties: productProperties }
  }
}

// ─────────────────────────────────────────
// CREATE PRODUCT
// ─────────────────────────────────────────

export const createProductSchema = {
  body: {
    type: 'object',
    required: ['name', 'sku', 'basePrice', 'categoryId', 'supplierId'],
    properties: {
      name: { type: 'string', minLength: 1 },
      sku: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      basePrice: { type: 'number', minimum: 0 },
      salePrice: { type: 'number', minimum: 0 },
      currentStock: { type: 'number', minimum: 0, default: 0 },
      stockThreshold: { type: 'number', minimum: 0, default: 10 },
      categoryId: { type: 'number' },
      supplierId: { type: 'number' },
      location: {
        type: 'object',
        properties: {
          warehouseId: { type: 'number' },
          aisle: { type: 'string' },
          shelf: { type: 'string' },
        }
      }
    }
  }
}

// ─────────────────────────────────────────
// UPDATE PRODUCT
// ─────────────────────────────────────────

export const updateProductSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      sku: { type: 'string' },
      description: { type: 'string' },
      basePrice: { type: 'number', minimum: 0 },
      salePrice: { type: 'number', minimum: 0 },
      currentStock: { type: 'number', minimum: 0 },
      stockThreshold: { type: 'number', minimum: 0 },
      categoryId: { type: 'number' },
      supplierId: { type: 'number' },
      location: {
        type: 'object',
        properties: {
          warehouseId: { type: 'number' },
          aisle: { type: 'string' },
          shelf: { type: 'string' },
        }
      }
    }
  }
}

// ─────────────────────────────────────────
// UPLOAD IMAGE
// ─────────────────────────────────────────

export const uploadImageSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string' } }
  },
  querystring: {
    type: 'object',
    properties: {
      isPrimary: { type: 'boolean', default: false }
    }
  }
}