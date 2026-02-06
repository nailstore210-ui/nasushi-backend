// هذا الكود لازم يكون في ملف مستقل اسمو script.js داخل مجلد public

// نربط الفورم بالحدث submit
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // ما نخليش الصفحة تعاود تتحدث

  // نجمع بيانات الزبون من الفورم
  const order = {
    name: document.getElementById("custName").value,
    phone: document.getElementById("custPhone").value,
    area: document.getElementById("custArea").value,
    total: calculateTotal(), // دالة تحسب المجموع من المنيو
    products: selectedProducts, // قائمة الأطباق اللي اختارها الزبون
    time: new Date().toLocaleString(),
    usedPoints: parseInt(document.getElementById("usedPoints")?.value) || 0 // إذا عندك input للنقاط
  };

  try {
    // نبعث الطلبية للسيرفر (رابط Render)
    const response = await fetch("https://nasushi-backend.onrender.com/order", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if (result.status === "success") {
      alert(`✅ تم إرسال الطلب! رقم الطلب: ${result.orderId}`);
      // تحديث واجهة النقاط
      document.getElementById("pointsBalance").textContent = result.newBalance;
    } else {
      alert("❌ صار مشكل في إرسال الطلب.");
    }
  } catch (err) {
    console.error("خطأ في الاتصال بالسيرفر:", err);
    alert("⚠️ السيرفر ما راهوش يرد.");
  }
});

// زر تحديث رصيد النقاط
document.getElementById("checkPoints").addEventListener("click", async () => {
  const phone = document.getElementById("custPhone").value;
  const response = await fetch(`https://nasushi-backend.onrender.com/points/${phone}`);
  const result = await response.json();
  document.getElementById("pointsBalance").textContent = result.points;
});

// مثال دالة تحسب المجموع (تقدري تبدليها حسب المنيو)
function calculateTotal() {
  return selectedProducts.reduce((sum, p) => sum + p.price, 0);
}

// مثال: قائمة المنتجات المختارة (تتبدل حسب المنيو الحقيقي)
let selectedProducts = [
  {name: "California Roll", price: 1090},
  {name: "Sushi Mix", price: 2400}
];
