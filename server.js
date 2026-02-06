const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 🏠 نخلي الموقع يبان مباشرة في /
app.use(express.static("NASUSHI21"));

// ✅ نخلي نص بسيط في /status باش نعرف أن السيرفر حي
app.get("/status", (req, res) => {
  res.send("✅ Nasushi Backend is running!");
});

// Twilio (يتفعل فقط إذا عندك المتغيرات)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// دوال العملاء
function readCustomers() {
  const filePath = path.join(__dirname, "customers.json");
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeCustomers(customers) {
  const filePath = path.join(__dirname, "customers.json");
  fs.writeFileSync(filePath, JSON.stringify(customers, null, 2), "utf8");
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
  return -1;
}

// ✅ Route لطلبية جديدة
app.post("/order", async (req, res) => {
  try {
    const order = req.body;
    const orderId = "ORD-" + Date.now();
    order.id = orderId;

    // 🪙 حساب النقاط
    const usedPoints = Number(order.usedPoints) || 0;
    let customers = readCustomers();
    const customerKey = order.phone;
    if (!customers[customerKey]) {
      customers[customerKey] = { name: order.name, phone: order.phone, points: 0 };
    }

    let currentPoints = customers[customerKey].points;
    if (currentPoints < usedPoints) {
      return res.send({ status: "error", message: "رصيد النقاط غير كافي" });
    }

    // ⚡ نحسب المجموع من المنتجات مباشرة
    const productsTotal = order.products.reduce((sum, p) => sum + Number(p.price), 0);

    let earnedPoints = 0;
    if (usedPoints === 0) {
      earnedPoints = Math.floor(productsTotal / 100);
      currentPoints += earnedPoints;
    }

    customers[customerKey].points = currentPoints;
    order.pointsEarned = earnedPoints;
    order.pointsUsed = usedPoints;
    order.pointsBalance = currentPoints;

    // ✅ حساب التوصيل والمجموع الكلي حسب المنطقة
    const deliveryFee = getDeliveryPrice(order.area);
    if (deliveryFee === -1) {
      return res.send({ status: "error", message: "المنطقة غير مدعومة" });
    }
    order.total = productsTotal;
    order.deliveryFee = deliveryFee;
    order.finalTotal = productsTotal + deliveryFee;

    // ✅ نخزن الطلبية
    fs.appendFileSync(path.join(__dirname, "orders.txt"), JSON.stringify(order) + "\n", "utf8");
    writeCustomers(customers);

    // ✅ الرد المباشر JSON
    res.send({
      status: "success",
      orderId,
      deliveryFee,
      finalTotal: order.finalTotal,
      newBalance: currentPoints
    });

  } catch (err) {
    console.error("❌ خطأ في معالجة الطلبية:", err.message);
    res.status(500).send({ error: "خطأ في معالجة الطلبية" });
  }
});

// ✅ Route لرصيد النقاط
app.get("/points/:phone", (req, res) => {
  const customers = readCustomers();
  const phone = req.params.phone;
  res.send({ points: customers[phone] ? customers[phone].points : 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
