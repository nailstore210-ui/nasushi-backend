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

  const area = document.getElementById("custArea").value;
  const deliveryFee = getDeliveryPrice(area);

  // نجمع بيانات الزبون من الفورم
  const order = {
    name: document.getElementById("custName").value,
    phone: phone,
    address: document.getElementById("custAddress").value,
    area: area,
    time: document.getElementById("custTime").value,
    total: calculateTotal(),
    products: selectedProducts,
    deliveryFee: deliveryFee,
    finalTotal: calculateTotal() + deliveryFee,
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
      alert(`✅ تم إرسال الطلب! 
رقم الطلب: ${result.orderId}
سعر التوصيل: ${result.deliveryFee} DA
المجموع الكلي: ${result.finalTotal} DA`);
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

  const area = document.getElementById("custArea").value;
  const delivery = getDeliveryPrice(area);
  document.getElementById("deliveryPrice").textContent = delivery >= 0 ? delivery : 0;
  document.getElementById("finalTotal").textContent = total + (delivery >= 0 ? delivery : 0);
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

// ✅ دالة حساب سعر التوصيل حسب المنطقة
function getDeliveryPrice(area) {
  const free = ["تفاحي","adll فلفلة","الفتوي","قرية لعرايس"];
  if (free.includes(area)) return 0;

  const hundred = ["بلاطان","القرية","الغطسة","ليابيي"];
  if (hundred.includes(area)) return 100;

  const oneFifty = ["شاطئ 8","شاطئ 10","الماناج"];
  if (oneFifty.includes(area)) return 150;

  const twoHundred = ["شاطئ 7","القرية السياحية","مارينا دور","سانتيفي","الجامعة","الاقامات الجامعية للإناث","الاقامات الجامعية للذكور","الحدائق"];
  if (twoHundred.includes(area)) return 200;

  const twoFifty = ["بوزعرورة","كوسيدار","جان دارك","لابيسين","adll بوزعرورة"];
  if (twoFifty.includes(area)) return 250;

  const threeHundred = ["33","حمادي كرومة","فالي","لاسيا","ليزالي","لبلاد","كامي","مرج الديب","بوبعلى","فوبور","واد الوحش","مسيون 1","مسيون 2","سانسو","سيسال","فاووث","ليباتيمو الشناوة","صالح بولكروة","زفزاف 1","زفزاف 2"];
  if (threeHundred.includes(area)) return 300;

  return -1; // إذا المنطقة مشي موجودة
}

// أول مرة نحدث السلة
updateCart();
