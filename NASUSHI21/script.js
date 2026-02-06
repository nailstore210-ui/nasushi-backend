// 📝 دالة تأكيد الطلبية (تستدعى من الفورم مباشرة)
async function confirmOrder(e) {
  e.preventDefault(); // ما نخليش الصفحة تعاود تتحدث

  // ✅ التحقق من رقم الهاتف (لازم 10 أرقام)
  const phone = document.getElementById("custPhone").value.trim();
  if (!/^\d{10}$/.test(phone)) {
    document.getElementById("phoneError").style.display = "inline";
    return;
  } else {
    document.getElementById("phoneError").style.display = "none";
  }

  // نجمع بيانات الزبون من الفورم
  const order = {
    name: document.getElementById("custName").value,
    phone: phone,
    address: document.getElementById("custAddress").value,
    area: document.getElementById("custArea").value,
    time: document.getElementById("custTime").value,
    total: calculateTotal(),
    products: selectedProducts,
    usedPoints: parseInt(document.getElementById("usedPoints")?.value) || 0
  };

  try {
    const response = await fetch("https://nasushi-backend.onrender.com/order", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if (result.status === "success") {
      alert(`✅ تم إرسال الطلب! رقم الطلب: ${result.orderId}\nالمجموع الكلي مع التوصيل: ${result.finalTotal} DA`);
      const balanceEl = document.getElementById("pointsBalance");
      if (balanceEl) balanceEl.textContent = result.newBalance;
    } else {
      alert("❌ صار مشكل في إرسال الطلب.");
    }
  } catch (err) {
    console.error("خطأ في الاتصال بالسيرفر:", err);
    alert("⚠️ السيرفر ما راهوش يرد.");
  }
}

// زر تحديث رصيد النقاط
const checkBtn = document.getElementById("checkPoints");
if (checkBtn) {
  checkBtn.addEventListener("click", async () => {
    const phone = document.getElementById("custPhone").value.trim();
    if (!phone) {
      alert("⚠️ لازم تدخل رقم الهاتف أولا.");
      return;
    }
    const response = await fetch(`https://nasushi-backend.onrender.com/points/${phone}`);
    const result = await response.json();
    document.getElementById("pointsBalance").textContent = result.points;
  });
}

// 🛒 قائمة المنتجات المختارة (تبدأ فارغة)
let selectedProducts = [];

// 🛒 دالة تحسب المجموع
function calculateTotal() {
  return selectedProducts.reduce((sum, p) => sum + p.price, 0);
}

// 🛒 دالة تحديث السلة
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  selectedProducts.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - ${p.price} DA`;

    // زر حذف
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = () => removeProduct(index);

    li.appendChild(removeBtn);
    cartItems.appendChild(li);
  });

  const total = calculateTotal();
  document.getElementById("cartTotal").textContent = total;

  const delivery = 200; // ثابت
  document.getElementById("deliveryPrice").textContent = delivery;
  document.getElementById("finalTotal").textContent = total + delivery;
}

// 🛒 دالة لإضافة منتج
function addProduct(name, price) {
  selectedProducts.push({ name, price });
  updateCart();
}

// 🛒 دالة لحذف منتج
function removeProduct(index) {
  selectedProducts.splice(index, 1);
  updateCart();
}

// أول مرة نحدث السلة
updateCart();
