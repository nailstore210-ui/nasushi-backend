// 🛒 السلة والاختيارات
let cart = [];
let selectedPrices = {};
const API_URL = "https://nasushi-backend.onrender.com"; // رابط السيرفر على Render

// ... كل دوال updatePrice, addToCart, removeItem, getDeliveryPrice, updateCart ...

// 📝 دالة تأكيد الطلبية
async function confirmOrder(e) {
  e.preventDefault();

  const phone = document.getElementById("custPhone").value.trim();
  if (!/^\d{10}$/.test(phone)) {
    document.getElementById("phoneError").style.display = "inline";
    return;
  } else {
    document.getElementById("phoneError").style.display = "none";
  }

  if (cart.length === 0) {
    alert("⚠️ السلة فارغة!");
    return;
  }

  const area = document.getElementById("custArea").value;
  const deliveryFee = getDeliveryPrice(area);
  if (deliveryFee === -1) {
    alert("⚠️ المنطقة غير مدعومة، يرجى التواصل معنا.");
    return;
  }

  let total = cart.reduce((sum, item) => sum + item.price, 0) + deliveryFee;

  const order = {
    name: document.getElementById("custName").value,
    phone: phone,
    address: document.getElementById("custAddress").value,
    area: area,
    time: document.getElementById("custTime").value,
    total: total,
    products: cart,
    deliveryFee: deliveryFee,
    finalTotal: total,
    usedPoints: parseInt(document.getElementById("usedPoints")?.value) || 0
  };

  try {
    const response = await fetch(`${API_URL}/order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if (result.status === "success") {
      alert(`✅ تم إرسال الطلب!
رقم الطلب: ${result.orderId}
سعر التوصيل: ${result.deliveryFee} DA
المجموع الكلي: ${result.finalTotal} DA`);

      const balanceEl = document.getElementById("pointsBalance");
      if (balanceEl) balanceEl.textContent = result.newBalance;

      cart = [];
      updateCart();
      document.getElementById("orderForm").reset();
    } else {
      alert("❌ صار مشكل في إرسال الطلب.");
    }
  } catch (err) {
    console.error("خطأ في الاتصال بالسيرفر:", err);
    alert("⚠️ السيرفر ما راهوش يرد.");
  }
}

// ✅ زر تحديث رصيد النقاط
const checkBtn = document.getElementById("checkPoints");
if (checkBtn) {
  checkBtn.addEventListener("click", async () => {
    const phone = document.getElementById("custPhone").value.trim();
    if (!phone) {
      alert("⚠️ لازم تدخل رقم الهاتف أولا.");
      return;
    }
    const response = await fetch(`${API_URL}/points/${phone}`);
    const result = await response.json();
    document.getElementById("pointsBalance").textContent = result.points;
  });
}

// أول مرة نحدث السلة
updateCart();
