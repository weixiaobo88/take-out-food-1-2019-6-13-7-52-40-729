const { loadAllItems } = require("./items");
const { loadPromotions } = require("./promotions");
const NO_PROMOTION = "NO_PROMOTION";
const THIRTY_MINUS_SIX = "满30减6元";
const SPECIFIED_FIFTY_PERCENT_OFF = "指定菜品半价";

function bestCharge(selectedItems) {
  const selected = count(selectedItems);
  const allItems = loadAllItems(); // 放在内部函数中，还是放在这里，传入到其他函数中
  const promotions = loadPromotions(); // 放在内部函数中，还是放在这里，传入到其他函数中
  const items = concat(selected, allItems);
  const total = calculate(items); // 放在内部函数中，还是放在这里，传入到其他函数中
  const selectedPromotion = selectPromotion(items, promotions, total);
  const receipt = generateReceipt(items, selectedPromotion, total);
  return receipt;
}

function count(selectedItems) {
  let result = [];
  for (let index = 0; index < selectedItems.length; index++) {
    const element = selectedItems[index];
    const splited = element.split(" x ");
    result.push({ id: splited[0], count: parseInt(splited[1]) });
  }
  return result;
}

function concat(selected, allItems) {
  let result = [];
  for (let index = 0; index < selected.length; index++) {
    const element = selected[index];
    const matched = findMatched(allItems, element.id);
    result.push({ ...element, ...matched });
  }
  return result;
}

function findMatched(allItems, id) {
  for (let index = 0; index < allItems.length; index++) {
    const element = allItems[index];
    if (element.id === id) {
      return element;
    }
  }
}

function calculate(items) {
  let total = 0;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    total += item.price * item.count;
  }
  return total;
}

function selectPromotion(items, promotions, total) {
  const satisfied = checkPromotions(items, promotions, total);

  if (satisfied.length === 0) {
    return { type: NO_PROMOTION };
  }

  if (satisfied.length === 1) {
    return { ...satisfied };
  }

  return chooseBest(satisfied);
}

function checkPromotions(items, promotions, total) {
  let result = [];
  for (let index = 0; index < promotions.length; index++) {
    const promotion = promotions[index];
    if (promotion.type === THIRTY_MINUS_SIX && total >= 30) {
      result.push({
        ...promotion,
        total,
        discount: 6,
        finalTotal: total - 6
      });
    } else if (
      promotion.type === SPECIFIED_FIFTY_PERCENT_OFF &&
      getPromotionItems(items, promotion.items).length > 0
    ) {
      const promotionItems = getPromotionItems(items, promotion.items);
      const discount = calculateDiscount(promotionItems);
      result.push({
        ...promotion,
        total,
        discount,
        promotionItems,
        finalTotal: total - discount
      });
    }
  }

  return result;
}

function getPromotionItems(items, allPromotionItems) {
  let result = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (allPromotionItems.indexOf(item.id) > -1) {
      result.push({ ...item });
    }
  }
  return result;
}

function calculateDiscount(promotionItems) {
  let discount = 0;
  for (let index = 0; index < promotionItems.length; index++) {
    const item = promotionItems[index];
    discount += (item.price * 1) / 2;
  }
  return discount;
}

function chooseBest(satisfied) {
  let minTotal = satisfied[0].finalTotal;
  let bestPromotion = { ...satisfied[0] };
  for (let index = 0; index < satisfied.length; index++) {
    const promotion = satisfied[index];
    if (promotion.finalTotal < minTotal) {
      minTotal = promotion.finalTotal;
      bestPromotion = { ...promotion };
    }
  }
  return bestPromotion;
}

function generateReceipt(items, selectedPromotion, total) {
  const details = getDetail(items);
  let finalTotal = total;
  const header = `============= 订餐明细 =============`;
  const content = `${details}`;
  const separator = `-----------------------------------`;
  const footer = `总计：${finalTotal}元
===================================`;

  if (selectedPromotion.type === NO_PROMOTION) {
    return `${header}
${content}
${separator}
${footer}`;
  }
  const type = `${selectedPromotion.type}${
    selectedPromotion.promotionItems
      ? formatNames(selectedPromotion.promotionItems)
      : ""
  }`;
  return `============= 订餐明细 =============
${details}
-----------------------------------
使用优惠:
${type}，省${selectedPromotion.discount}元
-----------------------------------
总计：${selectedPromotion.total - selectedPromotion.discount}元
===================================`;
}

function formatNames(promotionItems) {
  let result = "";
  for (let index = 0; index < promotionItems.length; index++) {
    const item = promotionItems[index];
    result += item.name + (index === promotionItems.length - 1 ? "" : "，");
  }
  return `(${result})`;
}

function getDetail(items) {
  let details = "";
  for (let index = 0; index < items.length; index++) {
    const element = items[index];
    details +=
      `${element.name} x ${element.count} = ${element.count *
        element.price}元` + (index === items.length - 1 ? "" : "\n");
  }
  return details;
}

module.exports = {
  count,
  concat,
  calculate,
  selectPromotion,
  generateReceipt,
  bestCharge,
  NO_PROMOTION
};
