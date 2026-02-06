// 🛒 السلة والاختيارات
let cart = [];
let selectedPrices = {};

// 📝 تحديد السعر حسب المنتج والحشو
function updatePrice(item, choice) {
  let price = 0;

  // California Roll
  if(item === "California Roll"){
    if(choice === "THON") price = 1090;
    else if(choice === "POULET CRISPY") price = 1190;
    else if(choice === "VEGITARIEEN") price = 1190;
    else if(choice === "CREVETTE") price = 1390;
    else if(choice === "SAUMON") price = 1390;
    else if(choice === "SURIMI") price = 1390;
  }

  // Crispy Roll
  if(item === "Crispy Roll"){
    if(choice === "THON") price = 1140;
    else if(choice === "POULET CRISPY") price = 1240;
    else if(choice === "CREVETTE") price = 1440;
    else if(choice === "SAUMON") price = 1440;
    else if(choice === "SURIMI") price = 1440;
  }

  // Futomaki
  if(item === "Futomaki"){
    if(choice === "THON") price = 1090;
    else if(choice === "POULET CRISPY") price = 1190;
    else if(choice === "CREVETTE") price = 1390;
    else if(choice === "VEGITARIEEN") price = 1190;
    else if(choice === "SAUMON") price = 1390;
    else if(choice === "SURIMI") price = 1390;
  }

  // Hosomaki
  if(item === "Hosomaki"){
    if(choice === "THON") price = 990;
    else if(choice === "POULET CRISPY") price = 990;
    else if(choice === "CREVETTE") price = 1190;
    else if(choice === "AVOCAT") price = 1090;
    else if(choice === "SAUMON") price = 1190;
    else if(choice === "SURIMI") price = 1150;
  }

  // Dragon Roll
  if(item === "Dragon Roll"){
    if(choice === "THON") price = 1690;
    else if(choice === "POULET CRISPY") price = 1690;
    else if(choice === "CREVETTE") price = 1890;
    else if(choice === "SAUMON") price = 1890;
    else if(choice === "SURIMI") price = 1890;
  }

  // Nigiri
  if(item === "Nigiri"){
    if(choice === "CREVETTE") price = 1490;
    else if(choice === "SAUMON") price = 1490;
    else if(choice === "AVOCAT") price = 1290;
  }

  // Gyoza
  if(item === "Gyoza"){
    if(choice === "POULET") price = 590;
    else if(choice === "VIANDE") price = 790;
    else if(choice === "CREVETTE") price = 990;
  }

  // Crunchy Roll
  if(item === "Crunchy Roll"){
    if(choice === "THON") price = 1140;
    else if(choice === "POULET CRISPY") price = 1240;
    else if(choice === "CREVETTE") price = 1440;
    else if(choice === "SAUMON") price = 1440;
    else if(choice === "SURIMI") price = 1440;
  }

  // Futomaki chesse
  if(item === "Futomaki chesse"){
    if(choice === "THON") price = 1190;
    else if(choice === "POULET CRISPY") price = 1290;
    else if(choice === "VEGITARIEEN") price = 1290;
    else if(choice === "CREVETTE") price = 1490;
    else if(choice === "SAUMON") price = 1490;
    else if(choice === "SURIMI") price = 1490;
  }

  // California roll chesse
  if(item === "California roll chesse"){
    if(choice === "THON") price = 1190;
    else if(choice === "POULET CRISPY") price = 1290;
    else if(choice === "VEGITARIEEN") price = 1290;
    else if(choice === "CREVETTE") price = 1490;
    else if(choice === "SAUMON") price = 1490;
    else if(choice === "SURIMI") price = 1490;
  }

  // Les Nems
  if(item === "Les Nems"){
    if(choice === "POULET") price = 690;
    else if(choice === "VIANDE") price = 890;
  }

  // Les Sauces
  if(item === "Les Sauces"){
    if(choice === "SOYA SAUCE SALE") price = 50;
    else if(choice === "SOJA SAUCE SUCRE") price = 100;
    else if(choice === "SPICY MAYO") price = 100;
    else if(choice === "CHILI GARLIC OIL") price = 100;
  }

  // Chop Sticks
  if(item === "Chop Sticks"){
    if(choice === "1 CHOP STICKS") price = 50;
  }

  // عرض السعر في الصفحة
  document.getElementById(item+"-price").innerText = "السعر: " + price + " DA";
  selectedPrices[item] = price;
}

// 🛒 إضافة للسلة
function addToCart(item){
  let price = selectedPrices[item];
  if(!price || price === 0){
    alert("⚠️ اختر الحشو أولاً!");
    return;
  }
  cart.push({name:item, price:price});
  updateCart();
}

// 🗑️ حذف عنصر
function removeItem(index){
  cart.splice(index,1);
  updateCart();
}

// 🚚 حساب سعر التوصيل حسب المنطقة
function getDeliveryPrice(area){
  const free = ["تفاحي","adll فلفلة","الفتوي","قرية لعرايس"];
  if(free.includes(area)) return 0;

  const hundred = ["بلاطان","القرية","الغطسة","ليابيي"];
  if(hundred.includes(area)) return 100;

  const oneFifty = ["شاطئ 8","شاطئ 10","الماناج"];
  if(oneFifty.includes(area)) return 150;

  const twoHundred = ["شاطئ 7","القرية السياحية","مارينا دور","سانتيفي","الجامعة","الاقامات الجامعية للإناث","الاقامات الجامعية للذكور","الحدائق"];
  if(twoHundred.includes(area)) return 200;

  const twoFifty = ["بوزعرورة","كوسيدار","جان دارك","لابيسين","adll بوزعرورة"];
  if(twoFifty.includes(area)) return 250;

  const threeHundred = ["33","حمادي كرومة","فالي","لاسيا","ليزالي","لبلاد","كامي","مرج الديب","بوبعلى","فوبور","واد الوحش","مسيون 1","مسيون 2","سانسو","سيسال","فاووث","ليباتيمو الشناوة","صالح بولكروة","زفزاف 1","زفزاف 2"];
  if(threeHundred.includes(area)) return 300;

  return -1;
}

// 🛒 تحديث السلة
function updateCart(){
  const cartList = document.getElementById("cartItems");
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index)=>{
    total += item.price;
    cartList.innerHTML += `<li>${item.name} - ${item.price} DA 
      <button onclick="removeItem(${index})">❌</button></li>`;
  });

  document.getElementById("cartTotal").innerText = total;

  const area = document.getElementById("custArea") ? document.getElementById("custArea").value : "";
  let deliveryPrice = getDeliveryPrice(area);
  let deliveryMessage = "";

  if(deliveryPrice === 0 && area !== ""){
    deliveryMessage = "🎉 تهانينا، التوصيل مجاني!";
  }
  if(deliveryPrice === -1){
    deliveryPrice = 0;
    deliveryMessage = "⚠️ المنطقة غير مدعومة، يرجى التواصل معنا.";
  }

  document.getElementById("deliveryPrice").innerText = deliveryPrice;
  document.getElementById("deliveryMessage").innerText = deliveryMessage;
  document.getElementById("finalTotal").innerText = total + deliveryPrice;
}
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

  // ✅ التحقق من السلة
  if (cart.length === 0) {
    alert("⚠️ السلة فارغة!");
    return;
  }

  const area = document.getElementById("custArea").value;
  const deliveryFee = getDeliveryPrice(area);

  if (deliveryFee === -1) {
    alert("⚠️ المنطقة غير مدعومة، يرجى التواصل معنا عبر واتساب أو فيسبوك/إنستغرام.");
    return;
  }

  // 🛒 حساب المجموع
  let total = cart.reduce((sum, item) => sum + item.price, 0);
  total += deliveryFee;

  // نجمع بيانات الزبون من الفورم
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

      // 🪙 تحديث رصيد النقاط
      const balanceEl = document.getElementById("pointsBalance");
      if (balanceEl) balanceEl.textContent = result.newBalance;

      // 📝 عرض ملخص الطلبية
      document.getElementById("orderSummary").style.display = "block";
      let productNames = cart.map(item => item.name + " (" + item.price + " DA)").join("، ");
      document.getElementById("summaryItems").innerText = "المنتجات المختارة: " + productNames;
      document.getElementById("summaryDelivery").innerText = "سعر التوصيل: " + deliveryFee + " DA";
      document.getElementById("summaryTotal").innerText = "المجموع الكلي مع التوصيل: " + total + " DA";
      document.getElementById("summaryPoints").innerText = "🪙 رصيدك الحالي: " + result.newBalance;

      // تفريغ السلة وإعادة ضبط الفورم
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
    const response = await fetch(`https://nasushi-backend.onrender.com/points/${phone}`);
    const result = await response.json();
    document.getElementById("pointsBalance").textContent = result.points;
  });
}

// أول مرة نحدث السلة
updateCart();
