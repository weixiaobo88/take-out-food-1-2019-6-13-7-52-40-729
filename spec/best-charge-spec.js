const {
  count,
  concat,
  calculate,
  selectPromotion,
  generateReceipt,
  bestCharge,
  NO_PROMOTION
} = require("../src/best-charge");
const { loadAllItems } = require("../src/items");
const { loadPromotions } = require("../src/promotions");

describe("Take out food", function() {
  it("should count selected items", function() {
    const inputs = ["ITEM0013 x 4", "ITEM0022 x 1"];
    const selected = count(inputs);
    const expected = [
      { id: "ITEM0013", count: 4 },
      { id: "ITEM0022", count: 1 }
    ];
    expect(selected).toEqual(expected);
  });

  it("should concat selected items", function() {
    const selected = [
      { id: "ITEM0013", count: 4 },
      { id: "ITEM0022", count: 1 }
    ];
    const allItems = loadAllItems();
    const items = concat(selected, allItems);
    const expected = [
      { id: "ITEM0013", count: 4, name: "肉夹馍", price: 6.0 },
      { id: "ITEM0022", count: 1, name: "凉皮", price: 8.0 }
    ];
    expect(items).toEqual(expected);
  });

  it("should calculated total of selected items", function() {
    const selected = [
      { id: "ITEM0013", count: 4, name: "肉夹馍", price: 6.0 },
      { id: "ITEM0022", count: 1, name: "凉皮", price: 8.0 }
    ];
    const total = calculate(selected);
    const expected = 32;
    expect(total).toEqual(expected);
  });

  it("should get selcted promotion", function() {
    const selected = [{ id: "ITEM0013", count: 4, name: "肉夹馍", price: 6.0 }];
    const promotions = loadPromotions();
    const selectedPromotion = selectPromotion(selected, promotions, 24);
    const expected = { type: NO_PROMOTION };
    expect(selectedPromotion).toEqual(expected);
  });

  it("should get selcted promotion", function() {
    const selected = [
      { id: "ITEM0013", count: 4, name: "肉夹馍", price: 6.0 },
      { id: "ITEM0022", count: 1, name: "凉皮", price: 8.0 }
    ];
    const promotions = loadPromotions();
    const selectedPromotion = selectPromotion(selected, promotions, 32);
    const expected = {
      type: "满30减6元",
      total: 32,
      discount: 6,
      finalTotal: 26
    };
    expect(selectedPromotion).toEqual(expected);
  });

  it("should get selcted promotion", function() {
    const selected = [
      { id: "ITEM0001", count: 1, name: "黄焖鸡", price: 18.0 },
      { id: "ITEM0013", count: 2, name: "肉夹馍", price: 6.0 },
      { id: "ITEM0022", count: 1, name: "凉皮", price: 8.0 }
    ];
    const promotions = loadPromotions();
    const selectedPromotion = selectPromotion(selected, promotions, 38);
    const expected = {
      type: "指定菜品半价",
      total: 38,
      discount: 13,
      finalTotal: 25,
      items: ["ITEM0001", "ITEM0022"],
      promotionItems: [
        { id: "ITEM0001", count: 1, name: "黄焖鸡", price: 18 },
        { id: "ITEM0022", count: 1, name: "凉皮", price: 8 }
      ]
    };
    expect(selectedPromotion).toEqual(expected);
  });

  it("should generate best charge when no promotion can be applied", function() {
    let inputs = ["ITEM0013 x 4"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
-----------------------------------
总计：24元
===================================`.trim();
    expect(summary).toEqual(expected);
  });

  it("should get receipt when promotion THIRTY_MINUS_SIX applied", function() {
    const selected = [
      { id: "ITEM0013", count: 4, name: "肉夹馍", price: 6.0 },
      { id: "ITEM0022", count: 1, name: "凉皮", price: 8.0 }
    ];
    const selectedPromotion = { type: "满30减6元", total: 32, discount: 6 };
    const receipt = generateReceipt(selected, selectedPromotion);
    const expected = `============= 订餐明细 =============
肉夹馍 x 4 = 24元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------
总计：26元
===================================`;
    expect(receipt).toEqual(expected);
  });

  it("should generate best charge when best is 指定菜品半价", function() {
    let inputs = ["ITEM0001 x 1", "ITEM0013 x 2", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
黄焖鸡 x 1 = 18元
肉夹馍 x 2 = 12元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
指定菜品半价(黄焖鸡，凉皮)，省13元
-----------------------------------
总计：25元
===================================`.trim();
    expect(summary).toEqual(expected);
  });

  it("should generate best charge when best is 满30减6元", function() {
    let inputs = ["ITEM0013 x 4", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------
总计：26元
===================================`.trim();
    expect(summary).toEqual(expected);
  });
});
