var express = require('express');
var router = express.Router();
let inventorySchema = require('../schemas/inventories');

function parseQuantity(quantity) {
  const parsed = Number(quantity);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

router.get('/', async function (req, res, next) {
  try {
    let result = await inventorySchema.find({}).populate({
      path: 'product'
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let result = await inventorySchema.findById(req.params.id).populate({
      path: 'product'
    });
    if (!result) {
      return res.status(404).send({
        message: 'INVENTORY NOT FOUND'
      });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(404).send({
      message: 'INVENTORY NOT FOUND'
    });
  }
});

router.post('/add-stock', async function (req, res, next) {
  let quantity = parseQuantity(req.body.quantity);
  if (!req.body.product || quantity === null) {
    return res.status(400).send({
      message: 'product and quantity (> 0) are required'
    });
  }

  try {
    let result = await inventorySchema.findOneAndUpdate(
      { product: req.body.product },
      { $inc: { stock: quantity } },
      { new: true }
    ).populate({ path: 'product' });

    if (!result) {
      return res.status(404).send({
        message: 'INVENTORY NOT FOUND'
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

router.post('/remove-stock', async function (req, res, next) {
  let quantity = parseQuantity(req.body.quantity);
  if (!req.body.product || quantity === null) {
    return res.status(400).send({
      message: 'product and quantity (> 0) are required'
    });
  }

  try {
    let result = await inventorySchema.findOneAndUpdate(
      { product: req.body.product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    ).populate({ path: 'product' });

    if (!result) {
      return res.status(400).send({
        message: 'NOT ENOUGH STOCK OR INVENTORY NOT FOUND'
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

router.post('/reservation', async function (req, res, next) {
  let quantity = parseQuantity(req.body.quantity);
  if (!req.body.product || quantity === null) {
    return res.status(400).send({
      message: 'product and quantity (> 0) are required'
    });
  }

  try {
    let result = await inventorySchema.findOneAndUpdate(
      { product: req.body.product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true }
    ).populate({ path: 'product' });

    if (!result) {
      return res.status(400).send({
        message: 'NOT ENOUGH STOCK OR INVENTORY NOT FOUND'
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

router.post('/sold', async function (req, res, next) {
  let quantity = parseQuantity(req.body.quantity);
  if (!req.body.product || quantity === null) {
    return res.status(400).send({
      message: 'product and quantity (> 0) are required'
    });
  }

  try {
    let result = await inventorySchema.findOneAndUpdate(
      { product: req.body.product, reserved: { $gte: quantity } },
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true }
    ).populate({ path: 'product' });

    if (!result) {
      return res.status(400).send({
        message: 'NOT ENOUGH RESERVED OR INVENTORY NOT FOUND'
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

module.exports = router;